// v98store API integration (OpenAI-compatible API)

import { API_CONFIG } from '@/config/api';
import { Message } from './types';

interface V98Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface V98ChatRequest {
  model: string;
  messages: V98Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export function convertToV98Messages(messages: Message[]): V98Message[] {
  return messages.map((msg) => ({
    role: msg.role as 'system' | 'user' | 'assistant',
    content: msg.content,
  }));
}

export async function streamChatCompletion(
  messages: V98Message[],
  temperature: number = 0.9,
  maxTokens: number = 2000
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = API_CONFIG.apiKey || process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const request: V98ChatRequest = {
    model: API_CONFIG.model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: true,
  };

  const response = await fetch(`${API_CONFIG.baseURL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`v98store API error: ${response.status} - ${error}`);
  }

  if (!response.body) {
    throw new Error('No response body from v98store API');
  }

  return response.body;
}

export async function sendChatCompletion(
  messages: V98Message[],
  temperature: number = 0.9,
  maxTokens: number = 2000
): Promise<string> {
  const apiKey = API_CONFIG.apiKey || process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const request: V98ChatRequest = {
    model: API_CONFIG.model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  };

  const response = await fetch(`${API_CONFIG.baseURL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`v98store API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

export async function testConnection(): Promise<boolean> {
  try {
    const testMessages: V98Message[] = [
      { role: 'user', content: 'test' },
    ];

    await sendChatCompletion(testMessages, 0.5, 10);
    return true;
  } catch (error) {
    console.error('v98store connection test failed:', error);
    return false;
  }
}

export async function checkAPIHealth(): Promise<boolean> {
  const apiKey = API_CONFIG.apiKey || process.env.NEXT_PUBLIC_API_KEY;

  // If no API key, consider it unhealthy
  if (!apiKey) {
    return false;
  }

  try {
    // Simple test to check if the API is responding
    const response = await fetch(`${API_CONFIG.baseURL}/v1/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}
