// Server-Sent Events (SSE) streaming utilities

import { VibeMode } from './types';

export interface SSEMessage {
  type: 'content' | 'metadata' | 'error' | 'done';
  token?: string;
  metadata?: Record<string, any>;
  error?: string;
}

export function getSSEHeaders(): Record<string, string> {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  };
}

export function formatSSE(data: SSEMessage): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export function createSSEStream(
  source: ReadableStream<string>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const reader = source.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Send done event
            const doneMessage: SSEMessage = { type: 'done' };
            controller.enqueue(encoder.encode(formatSSE(doneMessage)));
            controller.close();
            break;
          }

          // Send content event
          const contentMessage: SSEMessage = {
            type: 'content',
            token: value,
          };
          controller.enqueue(encoder.encode(formatSSE(contentMessage)));
        }
      } catch (error) {
        // Send error event
        const errorMessage: SSEMessage = {
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        controller.enqueue(encoder.encode(formatSSE(errorMessage)));
        controller.error(error);
      }
    },
  });
}

export async function* processTokenStream(
  tokens: AsyncIterable<string>,
  vibe: VibeMode,
  signal?: AbortSignal
): AsyncGenerator<string> {
  try {
    for await (const token of tokens) {
      if (signal?.aborted) {
        break;
      }
      yield token;
    }
  } catch (error) {
    console.error('Error processing token stream:', error);
    throw error;
  }
}

export async function* extractTokensFromV98Stream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
            console.warn('Failed to parse SSE data:', data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function createErrorStream(error: Error): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const errorMessage: SSEMessage = {
    type: 'error',
    error: error.message,
  };

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(formatSSE(errorMessage)));
      controller.close();
    },
  });
}
