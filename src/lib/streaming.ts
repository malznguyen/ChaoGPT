import { VibeMode, StreamChunk } from './types';
import {
  getThinkingDelay,
  shouldInjectReaction,
  getRandomReaction,
  determineEmotionalTone,
} from './personality';

// Create SSE formatted message
export function formatSSE(data: StreamChunk): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process token with personality and delays
export async function* processTokenStream(
  tokens: AsyncGenerator<string, void, unknown>,
  vibe: VibeMode,
  signal?: AbortSignal
): AsyncGenerator<StreamChunk, void, unknown> {
  let buffer = '';
  let sentenceBuffer = '';
  let tokenCount = 0;

  // Send thinking indicator first
  yield {
    type: 'thinking',
    token: '...',
  };

  await sleep(getThinkingDelay(vibe));

  for await (const token of tokens) {
    // Check if request was aborted
    if (signal?.aborted) {
      yield {
        type: 'error',
        status: 'error',
        error: 'Request aborted',
      };
      return;
    }

    buffer += token;
    sentenceBuffer += token;
    tokenCount++;

    // Send the token
    yield {
      type: 'content',
      token,
    };

    // Add natural delay between tokens
    const delay = getThinkingDelay(vibe);
    await sleep(delay);

    // Check if we hit a sentence boundary
    const sentenceBoundaries = ['. ', '! ', '? ', '\n\n'];
    const hitBoundary = sentenceBoundaries.some(boundary =>
      sentenceBuffer.endsWith(boundary)
    );

    if (hitBoundary) {
      // Maybe inject a reaction
      if (shouldInjectReaction(vibe, tokenCount)) {
        const reaction = getRandomReaction(vibe);
        yield {
          type: 'reaction',
          reaction,
        };
        await sleep(100); // Pause after reaction
      }

      sentenceBuffer = '';
    }

    // Every 50 tokens, add a small pause for "thinking"
    if (tokenCount % 50 === 0) {
      await sleep(100);
    }
  }

  // Determine final emotional tone
  const emotionalTone = determineEmotionalTone(buffer, vibe);

  yield {
    type: 'emotion',
    emotion: emotionalTone,
  };

  // Send completion signal
  yield {
    type: 'end',
    status: 'complete',
  };
}

// Create a ReadableStream for SSE
export function createSSEStream(
  chunks: AsyncGenerator<StreamChunk, void, unknown>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      // Send heartbeat comment to establish connection
      controller.enqueue(encoder.encode(': heartbeat\n\n'));

      try {
        for await (const chunk of chunks) {
          const formatted = formatSSE(chunk);
          controller.enqueue(encoder.encode(formatted));

          // If this is an end or error chunk, we're done
          if (chunk.type === 'end' || chunk.type === 'error') {
            break;
          }
        }
      } catch (error) {
        // Send error chunk
        const errorChunk: StreamChunk = {
          type: 'error',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        controller.enqueue(encoder.encode(formatSSE(errorChunk)));
      } finally {
        controller.close();
      }
    },

    cancel() {
      // Cleanup if stream is cancelled
      console.log('Stream cancelled by client');
    },
  });
}

// Convert v98store stream to token stream
export async function* extractTokensFromV98Stream(
  v98Stream: AsyncGenerator<any, void, unknown>
): AsyncGenerator<string, void, unknown> {
  for await (const chunk of v98Stream) {
    // Extract content from delta
    const content = chunk.choices?.[0]?.delta?.content;

    if (content) {
      yield content;
    }

    // Check for finish reason
    const finishReason = chunk.choices?.[0]?.finish_reason;
    if (finishReason) {
      // Stream is complete
      return;
    }
  }
}

// Add heartbeat to keep connection alive
export async function* withHeartbeat<T>(
  stream: AsyncGenerator<T, void, unknown>,
  intervalMs: number = 15000
): AsyncGenerator<T, void, unknown> {
  let lastYield = Date.now();

  const heartbeatCheck = async () => {
    while (true) {
      await sleep(intervalMs);
      const now = Date.now();

      if (now - lastYield > intervalMs) {
        // This is just a check; actual heartbeat is sent in createSSEStream
        break;
      }
    }
  };

  const heartbeatPromise = heartbeatCheck();

  try {
    for await (const item of stream) {
      lastYield = Date.now();
      yield item;
    }
  } finally {
    // Cleanup
  }
}

// Handle stream errors with personality
export function createErrorStream(error: any, vibe: VibeMode = 'chaotic'): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      const errorMessage = error.message || 'Something went wrong';

      const errorChunk: StreamChunk = {
        type: 'error',
        status: 'error',
        error: errorMessage,
      };

      controller.enqueue(encoder.encode(formatSSE(errorChunk)));
      controller.close();
    },
  });
}

// Wrapper to handle cleanup and errors
export async function* safeStreamWrapper<T>(
  generator: AsyncGenerator<T, void, unknown>,
  onError?: (error: Error) => void,
  onComplete?: () => void
): AsyncGenerator<T, void, unknown> {
  try {
    for await (const item of generator) {
      yield item;
    }
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    throw error;
  } finally {
    if (onComplete) {
      onComplete();
    }
  }
}

// Create response headers for SSE
export function getSSEHeaders(): Record<string, string> {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  };
}

// Check if request accepts SSE
export function acceptsSSE(request: Request): boolean {
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/event-stream') || accept.includes('*/*');
}
