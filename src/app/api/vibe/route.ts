import { NextRequest } from 'next/server';
import { VibeMode, VibeAnalysis } from '@/lib/types';
import { getConversation, updateConversationVibe } from '@/lib/conversation';
import { calculateVibeScore } from '@/lib/personality';
import { createErrorResponse, logError } from '@/lib/errors';

export const runtime = 'edge';

// Analyze conversation and suggest vibe
function analyzeConversationVibe(conversationId: string): VibeAnalysis | null {
  const conversation = getConversation(conversationId);

  if (!conversation) {
    return null;
  }

  const vibeScore = calculateVibeScore(conversation.messages);
  const chaosLevel = conversation.metadata.chaosLevel;

  // Determine suggested vibe based on conversation patterns
  let suggestedVibe: VibeMode | undefined;

  if (chaosLevel > 75) {
    suggestedVibe = 'unhinged';
  } else if (chaosLevel < 30) {
    suggestedVibe = 'soft';
  } else if (vibeScore > 70) {
    suggestedVibe = 'chaotic';
  } else if (vibeScore < 40) {
    suggestedVibe = 'study';
  }

  // Generate reasoning
  let reasoning = '';
  if (suggestedVibe === 'unhinged') {
    reasoning = 'the chaos levels are off the charts, time to go full unhinged';
  } else if (suggestedVibe === 'soft') {
    reasoning = 'giving soft vibes, let\'s keep it gentle';
  } else if (suggestedVibe === 'chaotic') {
    reasoning = 'the energy is chaotic but manageable, perfect vibe';
  } else if (suggestedVibe === 'study') {
    reasoning = 'focused energy detected, study mode might work better';
  } else {
    reasoning = 'current vibe is working, no changes needed';
  }

  return {
    currentVibe: conversation.currentVibe,
    vibeScore,
    suggestedVibe,
    reasoning,
    chaosLevel,
  };
}

// GET - Analyze vibe for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'missing_conversation_id',
            message: 'bestie you gotta tell me which conversation to analyze',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const analysis = analyzeConversationVibe(conversationId);

    if (!analysis) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'conversation_not_found',
            message: 'can\'t find that conversation bestie 👻',
          },
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(analysis), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logError(error, { endpoint: '/api/vibe', method: 'GET' });
    return createErrorResponse(error);
  }
}

// POST - Update vibe for a conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, vibe } = body;

    if (!conversationId || !vibe) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'invalid_request',
            message: 'need both conversationId and vibe bestie',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate vibe
    const validVibes: VibeMode[] = ['chaotic', 'soft', 'unhinged', 'study'];
    if (!validVibes.includes(vibe)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'invalid_vibe',
            message: `"${vibe}" isn't a vibe bestie, pick from: ${validVibes.join(', ')}`,
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const updated = updateConversationVibe(conversationId, vibe);

    if (!updated) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'conversation_not_found',
            message: 'can\'t find that conversation to update 👻',
          },
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversation: updated,
        message: `vibe switched to ${vibe}! ✨`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    logError(error, { endpoint: '/api/vibe', method: 'POST' });
    return createErrorResponse(error);
  }
}
