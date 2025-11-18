import { NextRequest } from 'next/server';
import { VibeMode, Message } from '@/lib/types';
import { streamChatCompletion, convertToV98Messages, estimateTokens } from '@/lib/v98store';
import {
  buildSystemPrompt,
  getResponseStarter,
  getResponseEnder,
  detectSentiment,
  isBeefMode,
  getBeefModeResponse,
} from '@/lib/personality';
import {
  createConversation,
  getConversation,
  addMessage,
  getConversationContext,
  updateConversationVibe,
  needsBreakReminder,
  updateAverageResponseTime,
} from '@/lib/conversation';
import {
  getSessionId,
  checkRateLimit,
  recordRequest,
  isRateLimited,
  createRateLimitResponse,
  detectSpam,
  updateChaosScore,
  isSpamming,
  getRateLimitHeaders,
} from '@/lib/rate-limit';
import { validateChatRequest, createErrorResponse, logError } from '@/lib/errors';
import {
  createSSEStream,
  processTokenStream,
  extractTokensFromV98Stream,
  getSSEHeaders,
  createErrorStream,
} from '@/lib/streaming';
import { getBreakReminder, shouldSuggestBreak } from '@/lib/personality';

// Edge runtime for better streaming performance
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get session ID for rate limiting
    const sessionId = getSessionId(request);

    // Check rate limit
    if (isRateLimited(sessionId)) {
      const rateLimitInfo = checkRateLimit(sessionId);
      return createRateLimitResponse(rateLimitInfo);
    }

    // Check for spamming behavior
    if (isSpamming(sessionId)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'spam_detected',
            message: 'bestie stop spamming, i know you\'re bored but this ain\'t it 🛑',
          },
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    validateChatRequest(body);

    // Record request for rate limiting
    recordRequest(sessionId);

    const {
      message: userMessage,
      conversationId,
      vibe = 'chaotic' as VibeMode,
      context = [],
    } = body;

    // Detect spam in message
    if (detectSpam(userMessage)) {
      updateChaosScore(sessionId, 'spam');
      return new Response(
        JSON.stringify({
          error: {
            code: 'spam_detected',
            message: 'that looks like spam bestie, try sending a real message',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update chaos score (normal behavior)
    updateChaosScore(sessionId, 'normal');

    // Get or create conversation
    let conversation = conversationId ? getConversation(conversationId) : null;

    if (!conversation) {
      conversation = createConversation(userMessage, vibe);
    } else if (conversation.currentVibe !== vibe) {
      // Update vibe if changed
      updateConversationVibe(conversation.id, vibe);
      conversation = getConversation(conversation.id)!;
    }

    // Add user message to conversation
    const userMessageObj = addMessage(conversation.id, {
      role: 'user',
      content: userMessage,
      vibe,
      reactions: [],
      tokens: estimateTokens(userMessage),
      metadata: {
        model: 'user',
        temperature: 0,
        wasChaoticResponse: false,
      },
    });

    // Detect sentiment for personality adjustment
    const sentiment = detectSentiment(userMessage);

    // Build messages for API
    const conversationHistory = getConversationContext(conversation.id, 10);
    const systemPrompt = buildSystemPrompt(vibe, conversationHistory.map(msg => ({
      ...msg,
      id: '',
      timestamp: new Date(),
      vibe,
      reactions: [],
      tokens: 0,
      metadata: {
        model: 'gpt-4o',
        temperature: 0.9,
        wasChaoticResponse: false,
      },
    })));

    // Add personality-driven response starter
    const responseStarter = getResponseStarter(vibe, sentiment);

    // Check for beef mode
    const beefModeActive = isBeefMode(userMessage);
    let beefModePrefix = '';
    if (beefModeActive) {
      beefModePrefix = getBeefModeResponse() + '\n\n';
    }

    // Build API messages
    const apiMessages = convertToV98Messages([
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
    ]);

    // Start streaming response
    const v98Stream = streamChatCompletion(apiMessages);
    const tokenStream = extractTokensFromV98Stream(v98Stream);

    // Process stream with personality
    const processedStream = processTokenStream(tokenStream, vibe, request.signal);

    // Create SSE stream
    const sseStream = createSSEStream(processedStream);

    // Collect response for storage (this happens async)
    let fullResponse = '';
    const originalReader = sseStream.getReader();

    // Create a new stream that tees the data
    const responseStream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await originalReader.read();

            if (done) {
              // Stream complete, save message
              const endTime = Date.now();
              const duration = endTime - startTime;

              // Save assistant message
              addMessage(conversation!.id, {
                role: 'assistant',
                content: fullResponse,
                vibe,
                reactions: [],
                tokens: estimateTokens(fullResponse),
                streamDuration: duration,
                metadata: {
                  model: 'gpt-4o',
                  temperature: 0.9,
                  wasChaoticResponse: vibe === 'unhinged' || vibe === 'chaotic',
                  emotionalTone: 'sassy',
                },
              });

              // Update average response time
              updateAverageResponseTime(conversation!.id, duration);

              // Check if break reminder needed
              if (needsBreakReminder(conversation!.id)) {
                const breakReminder = getBreakReminder();
                // Could send this as a system message, but for now just log
                console.log('Break reminder suggested:', breakReminder);
              }

              controller.close();
              break;
            }

            // Parse chunk to collect response text
            const text = decoder.decode(value, { stream: true });
            const lines = text.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'content' && data.token) {
                    fullResponse += data.token;
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }

            // Forward chunk to client
            controller.enqueue(value);
          }
        } catch (error) {
          logError(error, {
            conversationId: conversation?.id,
            vibe,
            sessionId,
          });
          controller.error(error);
        }
      },
    });

    // Get rate limit info
    const rateLimitInfo = checkRateLimit(sessionId);

    // Return streaming response
    return new Response(responseStream, {
      headers: {
        ...getSSEHeaders(),
        ...getRateLimitHeaders(rateLimitInfo),
        'X-Conversation-Id': conversation.id,
        'X-Vibe': vibe,
      },
    });

  } catch (error) {
    logError(error, { endpoint: '/api/chat' });

    // Return error response
    return createErrorResponse(error);
  }
}

// GET endpoint for testing
export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'ChaoGPT Chat API is running! POST a message to start chatting.',
      endpoint: '/api/chat',
      methods: ['POST'],
      vibe: 'chaotic af',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
