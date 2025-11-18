import { V98StoreConfig, V98StoreMessage, V98StoreStreamResponse } from './types';

// Default configuration for v98store API
export const DEFAULT_CONFIG: Omit<V98StoreConfig, 'apiKey' | 'baseURL'> = {
  model: 'gpt-4o',
  temperature: 0.9, // Higher for more chaos
  max_tokens: 2000,
  stream: true,
  presence_penalty: 0.6, // Reduce repetition
  frequency_penalty: 0.3,
};

// Get API configuration from environment
export function getV98StoreConfig(): V98StoreConfig {
  const apiKey = process.env.V98STORE_API_KEY;
  const baseURL = process.env.V98STORE_API_URL || 'https://v98store.com';

  if (!apiKey) {
    throw new Error('V98STORE_API_KEY environment variable is not set');
  }

  return {
    ...DEFAULT_CONFIG,
    apiKey,
    baseURL,
  };
}

// Exponential backoff retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof V98StoreError) {
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
      }

      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Custom error class for v98store API errors
export class V98StoreError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'V98StoreError';
  }
}

// Parse error response from API
function parseErrorResponse(statusCode: number, data: any): V98StoreError {
  const errorCode = data?.error?.code || `HTTP_${statusCode}`;
  const errorMessage = data?.error?.message || `API request failed with status ${statusCode}`;

  return new V98StoreError(errorMessage, statusCode, errorCode, data);
}

// Main streaming function
export async function* streamChatCompletion(
  messages: V98StoreMessage[],
  config?: Partial<V98StoreConfig>
): AsyncGenerator<V98StoreStreamResponse, void, unknown> {
  const fullConfig = { ...getV98StoreConfig(), ...config };

  const requestBody = {
    model: fullConfig.model,
    messages,
    temperature: fullConfig.temperature,
    max_tokens: fullConfig.max_tokens,
    stream: true,
    presence_penalty: fullConfig.presence_penalty,
    frequency_penalty: fullConfig.frequency_penalty,
  };

  let response: Response;

  try {
    // Make request with retry logic
    response = await withRetry(async () => {
      const res = await fetch(`${fullConfig.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fullConfig.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: { message: res.statusText } };
        }
        throw parseErrorResponse(res.status, errorData);
      }

      return res;
    });
  } catch (error) {
    throw error;
  }

  // Check if response body exists
  if (!response.body) {
    throw new Error('Response body is null');
  }

  // Process the stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith(':')) {
          continue;
        }

        // Parse SSE format: "data: {...}"
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);

          // Check for [DONE] signal
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data) as V98StoreStreamResponse;
            yield parsed;
          } catch (error) {
            console.error('Failed to parse streaming response:', error, data);
            // Continue processing other chunks
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Non-streaming completion for testing
export async function chatCompletion(
  messages: V98StoreMessage[],
  config?: Partial<V98StoreConfig>
): Promise<string> {
  const fullConfig = { ...getV98StoreConfig(), ...config, stream: false };

  const requestBody = {
    model: fullConfig.model,
    messages,
    temperature: fullConfig.temperature,
    max_tokens: fullConfig.max_tokens,
    stream: false,
    presence_penalty: fullConfig.presence_penalty,
    frequency_penalty: fullConfig.frequency_penalty,
  };

  const response = await withRetry(async () => {
    const res = await fetch(`${fullConfig.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fullConfig.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: { message: res.statusText } };
      }
      throw parseErrorResponse(res.status, errorData);
    }

    return res;
  });

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Health check for v98store API
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const config = getV98StoreConfig();

    const response = await fetch(`${config.baseURL}/v1/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    return response.ok;
  } catch (error) {
    console.error('v98store API health check failed:', error);
    return false;
  }
}

// Estimate token count (rough approximation)
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Convert Message[] to V98StoreMessage[]
export function convertToV98Messages(
  messages: Array<{ role: string; content: string }>
): V98StoreMessage[] {
  return messages.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
  }));
}
