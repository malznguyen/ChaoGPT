import { NextRequest } from 'next/server';
import {
  getAllConversations,
  createConversation,
  deleteConversation,
  searchConversations,
  getConversationStats,
} from '@/lib/conversation';
import { VibeMode } from '@/lib/types';
import { createErrorResponse, logError } from '@/lib/errors';

export const runtime = 'edge';

// GET - Get all conversations or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const includeStats = searchParams.get('stats') === 'true';

    let conversations;

    if (query) {
      // Search conversations
      conversations = searchConversations(query);
    } else {
      // Get all conversations
      conversations = getAllConversations();
    }

    const response: any = {
      conversations,
      count: conversations.length,
    };

    if (includeStats) {
      response.stats = getConversationStats();
    }

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    logError(error, { endpoint: '/api/conversations', method: 'GET' });
    return createErrorResponse(error);
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, vibe = 'chaotic' as VibeMode } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'invalid_request',
            message: 'need a message to start a conversation bestie',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const conversation = createConversation(message, vibe);

    return new Response(
      JSON.stringify({
        success: true,
        conversation,
        message: 'new chat started! let\'s go ✨',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    logError(error, { endpoint: '/api/conversations', method: 'POST' });
    return createErrorResponse(error);
  }
}

// DELETE - Delete all conversations (use with caution)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm');

    if (confirm !== 'yes') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'confirmation_required',
            message: 'add ?confirm=yes if you really wanna delete everything (this is permanent bestie)',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const conversations = getAllConversations();
    let deletedCount = 0;

    for (const convo of conversations) {
      if (deleteConversation(convo.id)) {
        deletedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        message: `deleted ${deletedCount} conversations, fresh start! 🆕`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    logError(error, { endpoint: '/api/conversations', method: 'DELETE' });
    return createErrorResponse(error);
  }
}
