// Conversation management

import { Conversation, Message, VibeMode } from './types';

// In-memory store for conversations (use database in production)
const conversations = new Map<string, Conversation>();

export function createConversation(
  firstMessage: string,
  vibe: VibeMode = 'chaotic'
): Conversation {
  const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();

  const conversation: Conversation = {
    id,
    title: generateTitle(firstMessage),
    messages: [],
    createdAt: now,
    updatedAt: now,
    currentVibe: vibe,
    stats: {
      totalMessages: 0,
      totalTokens: 0,
      averageResponseTime: 0,
      breakReminders: 0,
    },
  };

  conversations.set(id, conversation);
  return conversation;
}

export function getConversation(id: string): Conversation | null {
  return conversations.get(id) || null;
}

export function getAllConversations(): Conversation[] {
  return Array.from(conversations.values()).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

export function deleteConversation(id: string): boolean {
  return conversations.delete(id);
}

export function updateConversation(
  id: string,
  updates: Partial<Conversation>
): Conversation | null {
  const conversation = conversations.get(id);
  if (!conversation) return null;

  const updated = {
    ...conversation,
    ...updates,
    updatedAt: new Date(),
  };

  conversations.set(id, updated);
  return updated;
}

export function addMessage(id: string, message: Message): Message {
  const conversation = conversations.get(id);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  conversation.messages.push(message);
  conversation.stats.totalMessages++;
  conversation.stats.totalTokens += message.tokens || 0;
  conversation.updatedAt = new Date();

  conversations.set(id, conversation);
  return message;
}

export function getMessages(id: string): Message[] {
  const conversation = conversations.get(id);
  return conversation?.messages || [];
}

export function getConversationContext(
  id: string,
  maxMessages: number = 10
): Message[] {
  const conversation = conversations.get(id);
  if (!conversation) return [];

  // Return last N messages for context
  return conversation.messages.slice(-maxMessages);
}

export function updateConversationVibe(id: string, vibe: VibeMode): void {
  const conversation = conversations.get(id);
  if (conversation) {
    conversation.currentVibe = vibe;
    conversation.updatedAt = new Date();
    conversations.set(id, conversation);
  }
}

export function needsBreakReminder(id: string): boolean {
  const conversation = conversations.get(id);
  if (!conversation) return false;

  // Suggest break after 20 messages or 1 hour
  const messageThreshold = 20;
  const timeThreshold = 60 * 60 * 1000; // 1 hour

  const tooManyMessages = conversation.stats.totalMessages >= messageThreshold;
  const tooLongSession =
    Date.now() - conversation.createdAt.getTime() >= timeThreshold;

  return tooManyMessages || tooLongSession;
}

export function updateAverageResponseTime(id: string, duration: number): void {
  const conversation = conversations.get(id);
  if (!conversation) return;

  const { averageResponseTime, totalMessages } = conversation.stats;
  const newAverage =
    (averageResponseTime * (totalMessages - 1) + duration) / totalMessages;

  conversation.stats.averageResponseTime = newAverage;
  conversations.set(id, conversation);
}

export function searchConversations(query: string): Conversation[] {
  const lowerQuery = query.toLowerCase();
  return Array.from(conversations.values()).filter((conv) =>
    conv.title.toLowerCase().includes(lowerQuery)
  );
}

export function getConversationStats(id?: string) {
  // If ID provided, return stats for that conversation
  if (id) {
    const conversation = conversations.get(id);
    return conversation?.stats || null;
  }

  // Otherwise return global stats
  const allConversations = Array.from(conversations.values());
  const totalConversations = allConversations.length;
  const totalMessages = allConversations.reduce(
    (sum, conv) => sum + conv.stats.totalMessages,
    0
  );

  // Count vibe usage
  const vibeCount: Record<string, number> = {};
  allConversations.forEach((conv) => {
    vibeCount[conv.currentVibe] = (vibeCount[conv.currentVibe] || 0) + 1;
  });

  const mostUsedVibe = Object.entries(vibeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'chaotic';

  return {
    totalConversations,
    totalMessages,
    mostUsedVibe,
    chaosScore: Math.min(100, totalMessages / 10), // Simple chaos score calculation
  };
}

export function exportConversation(id: string): string {
  const conversation = conversations.get(id);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Export as JSON
  return JSON.stringify(conversation, null, 2);
}

function generateTitle(firstMessage: string): string {
  // Generate a title from the first message
  const cleaned = firstMessage.trim().toLowerCase();
  const maxLength = 50;

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength).trim() + '...';
}
