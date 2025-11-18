// Error handling utilities

export class ChatError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'ChatError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function validateChatRequest(body: any): void {
  if (!body.message || typeof body.message !== 'string') {
    throw new ChatError(
      'bestie you gotta send a message fr',
      'invalid_request',
      400
    );
  }

  if (body.message.length === 0) {
    throw new ChatError(
      'empty message? come on now, say something!',
      'empty_message',
      400
    );
  }

  if (body.message.length > 4000) {
    throw new ChatError(
      'whoa that message is way too long, keep it under 4000 chars bestie',
      'message_too_long',
      400
    );
  }
}

export function createErrorResponse(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof ChatError) {
    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
        },
      }),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Unknown error
  return new Response(
    JSON.stringify({
      error: {
        code: 'internal_error',
        message: 'oof something broke on our end, try again in a sec',
      },
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export function logError(error: unknown, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error:`, error);
  if (context) {
    console.error('Context:', context);
  }
}
