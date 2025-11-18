import { NextRequest } from 'next/server';
import {
  getConversation,
  deleteConversation,
  updateConversation,
  exportConversation,
  getMessages,
} from '@/lib/conversation';
import { createErrorResponse, logError } from '@/lib/errors';

export const runtime = 'edge';

// GET - Get a specific conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const messagesOnly = searchParams.get('messagesOnly') === 'true';

    const conversation = getConversation(id);

    if (!conversation) {
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

    // Export format
    if (format === 'json') {
      const exported = exportConversation(id);
      return new Response(exported, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="chaogpt-${id}.json"`,
        },
      });
    }

    // Messages only
    if (messagesOnly) {
      const messages = getMessages(id);
      return new Response(JSON.stringify({ messages }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Full conversation
    return new Response(JSON.stringify(conversation), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logError(error, { endpoint: '/api/conversations/[id]', method: 'GET' });
    return createErrorResponse(error);
  }
}

// PATCH - Update a conversation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const conversation = getConversation(id);

    if (!conversation) {
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

    // Only allow updating certain fields
    const allowedUpdates = ['title', 'emoji', 'currentVibe'];
    const updates: any = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updated = updateConversation(id, updates);

    return new Response(
      JSON.stringify({
        success: true,
        conversation: updated,
        message: 'conversation updated! ✨',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    logError(error, { endpoint: '/api/conversations/[id]', method: 'PATCH' });
    return createErrorResponse(error);
  }
}

// DELETE - Delete a specific conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const conversation = getConversation(id);

    if (!conversation) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'conversation_not_found',
            message: 'can\'t find that conversation to delete 👻',
          },
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const deleted = deleteConversation(id);

    if (deleted) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'conversation deleted! gone like my attention span 💨',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: {
            code: 'delete_failed',
            message: 'failed to delete that conversation, something went wrong',
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    logError(error, { endpoint: '/api/conversations/[id]', method: 'DELETE' });
    return createErrorResponse(error);
  }
}
