import { APIError } from './types';

// Error response messages with personality
export const ERROR_RESPONSES: Record<string, string> = {
  rate_limit: "bestie you're doing too much rn, take a breath 😭",
  api_error: "the vibes are off, something broke fr",
  invalid_request: "that's not it chief, try again",
  timeout: "sorry i was dissociating, what were we talking about? 👁️👄👁️",
  context_overflow: "we've been yapping too long, let's start fresh",
  authentication: "auth check failed, this is embarrassing 😬",
  server_error: "the servers are having a moment (not their fault, they're trying)",
  network_error: "my internet said nope, let's try that again",
  invalid_vibe: "that vibe doesn't exist bestie, pick a real one",
  conversation_not_found: "i can't find that chat, did it ghost me? 👻",
  message_too_long: "okay that's A LOT of words, can we make it shorter?",
  empty_message: "bestie you didn't say anything, what did you need?",
  service_unavailable: "i'm literally dying rn (the api is down)",
  unknown: "something weird happened and idk what, but we'll figure it out",
};

// Create an API error with personality
export function createAPIError(
  code: string,
  statusCode: number,
  technicalMessage?: string
): APIError {
  const personalityMessage = ERROR_RESPONSES[code] || ERROR_RESPONSES.unknown;

  return {
    code,
    message: technicalMessage || personalityMessage,
    personalityMessage,
    statusCode,
  };
}

// Map HTTP status codes to error codes
export function getErrorCodeFromStatus(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'invalid_request';
    case 401:
    case 403:
      return 'authentication';
    case 404:
      return 'conversation_not_found';
    case 408:
      return 'timeout';
    case 413:
      return 'message_too_long';
    case 429:
      return 'rate_limit';
    case 500:
    case 502:
    case 503:
      return 'server_error';
    case 504:
      return 'timeout';
    default:
      return 'unknown';
  }
}

// Handle v98store API errors
export function handleV98StoreError(error: any): APIError {
  if (error.statusCode) {
    const code = getErrorCodeFromStatus(error.statusCode);
    return createAPIError(code, error.statusCode, error.message);
  }

  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return createAPIError('network_error', 0, error.message);
  }

  // Unknown errors
  return createAPIError('unknown', 500, error.message);
}

// Validation errors
export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validate chat request
export function validateChatRequest(data: any): void {
  if (!data.message || typeof data.message !== 'string') {
    throw new ValidationError(
      ERROR_RESPONSES.empty_message,
      'empty_message'
    );
  }

  if (data.message.trim().length === 0) {
    throw new ValidationError(
      ERROR_RESPONSES.empty_message,
      'empty_message'
    );
  }

  if (data.message.length > 10000) {
    throw new ValidationError(
      ERROR_RESPONSES.message_too_long,
      'message_too_long'
    );
  }

  // Validate vibe if provided
  if (data.vibe) {
    const validVibes = ['chaotic', 'soft', 'unhinged', 'study'];
    if (!validVibes.includes(data.vibe)) {
      throw new ValidationError(
        ERROR_RESPONSES.invalid_vibe,
        'invalid_vibe'
      );
    }
  }
}

// Create error response for API routes
export function createErrorResponse(error: any): Response {
  let apiError: APIError;

  if (error instanceof ValidationError) {
    apiError = createAPIError(error.code, 400, error.message);
  } else if (error.statusCode) {
    apiError = handleV98StoreError(error);
  } else {
    apiError = createAPIError('unknown', 500, error.message);
  }

  return new Response(
    JSON.stringify({
      error: {
        code: apiError.code,
        message: apiError.personalityMessage,
        technical: apiError.message,
      },
    }),
    {
      status: apiError.statusCode || 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Log errors with context
export function logError(error: any, context: Record<string, any> = {}): void {
  console.error('[ChaoGPT Error]', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
    },
    context,
    timestamp: new Date().toISOString(),
  });
}
