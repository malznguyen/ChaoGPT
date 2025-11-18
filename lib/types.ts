// Core type definitions for ChaoGPT backend

export type VibeMode = 'chaotic' | 'soft' | 'unhinged' | 'study';

export type EmotionalTone = 'hyped' | 'chill' | 'concerned' | 'sassy';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  vibe: VibeMode;
  reactions: string[];
  tokens: number;
  streamDuration?: number;
  metadata: {
    model: string;
    temperature: number;
    wasChaoticResponse: boolean;
    emotionalTone?: EmotionalTone;
  };
}

export interface Conversation {
  id: string;
  title: string;
  emoji: string;
  messages: Message[];
  vibeScore: number;
  currentVibe: VibeMode;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    totalTokens: number;
    messageCount: number;
    chaosLevel: number;
    averageResponseTime: number;
  };
}

export interface V98StoreConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  temperature: number;
  max_tokens: number;
  stream: boolean;
  presence_penalty: number;
  frequency_penalty: number;
}

export interface StreamChunk {
  token?: string;
  reaction?: string;
  emotion?: string;
  type: 'content' | 'reaction' | 'emotion' | 'end' | 'error' | 'thinking';
  status?: 'complete' | 'error';
  error?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  vibe?: VibeMode;
  context?: Message[];
}

export interface ChatResponse {
  conversationId: string;
  message: Message;
  vibe: VibeMode;
}

export interface VibeAnalysis {
  currentVibe: VibeMode;
  vibeScore: number;
  suggestedVibe?: VibeMode;
  reasoning: string;
  chaosLevel: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  sessionId: string;
}

export interface APIError {
  code: string;
  message: string;
  personalityMessage: string;
  statusCode: number;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  vibeCheck: string;
  apiConnected: boolean;
  timestamp: Date;
  chaosLevel: number;
}

export interface V98StoreMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface V98StoreStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
    finish_reason?: string | null;
  }>;
}

export interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  averageVibeScore: number;
  mostUsedVibe: VibeMode;
  chaosScore: number;
}
