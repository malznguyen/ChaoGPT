// Core types for ChaoGPT

export type VibeMode = 'chaotic' | 'soft' | 'unhinged' | 'study';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  vibe?: VibeMode;
  reactions?: string[];
  tokens?: number;
  streamDuration?: number;
  metadata?: {
    model: string;
    temperature: number;
    wasChaoticResponse: boolean;
    emotionalTone?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  currentVibe: VibeMode;
  stats: {
    totalMessages: number;
    totalTokens: number;
    averageResponseTime: number;
    breakReminders: number;
  };
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: Date;
  isLimited: boolean;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  vibeCheck: string;
  apiConnected: boolean;
  timestamp: Date;
  chaosLevel: number;
}
