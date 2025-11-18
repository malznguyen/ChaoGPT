import { Conversation, Message, VibeMode, ConversationStats } from './types';
import {
  generateConversationTitle,
  generateConversationEmoji,
  calculateVibeScore,
} from './personality';

// In-memory storage for conversations
// In production, replace with Redis/Upstash or database
const conversations = new Map<string, Conversation>();

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new conversation
export function createConversation(firstMessage: string, vibe: VibeMode = 'chaotic'): Conversation {
  const id = generateId();
  const title = generateConversationTitle(firstMessage);
  const emoji = generateConversationEmoji();

  const conversation: Conversation = {
    id,
    title,
    emoji,
    messages: [],
    vibeScore: 50,
    currentVibe: vibe,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      totalTokens: 0,
      messageCount: 0,
      chaosLevel: vibe === 'unhinged' ? 100 : vibe === 'soft' ? 20 : 50,
      averageResponseTime: 0,
    },
  };

  conversations.set(id, conversation);
  return conversation;
}

// Get conversation by ID
export function getConversation(id: string): Conversation | null {
  return conversations.get(id) || null;
}

// Get all conversations
export function getAllConversations(): Conversation[] {
  return Array.from(conversations.values()).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

// Update conversation
export function updateConversation(id: string, updates: Partial<Conversation>): Conversation | null {
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

// Delete conversation
export function deleteConversation(id: string): boolean {
  return conversations.delete(id);
}

// Add message to conversation
export function addMessage(
  conversationId: string,
  message: Omit<Message, 'id' | 'timestamp'>
): Message | null {
  const conversation = conversations.get(conversationId);
  if (!conversation) return null;

  const newMessage: Message = {
    ...message,
    id: generateId(),
    timestamp: new Date(),
  };

  conversation.messages.push(newMessage);
  conversation.metadata.messageCount++;
  conversation.metadata.totalTokens += message.tokens;
  conversation.vibeScore = calculateVibeScore(conversation.messages);
  conversation.updatedAt = new Date();

  // Auto-cleanup: keep only last 50 messages
  if (conversation.messages.length > 50) {
    const removed = conversation.messages.shift();
    if (removed) {
      conversation.metadata.totalTokens -= removed.tokens;
      conversation.metadata.messageCount--;
    }
  }

  conversations.set(conversationId, conversation);
  return newMessage;
}

// Get messages for conversation with optional limit
export function getMessages(conversationId: string, limit?: number): Message[] {
  const conversation = conversations.get(conversationId);
  if (!conversation) return [];

  const messages = conversation.messages;
  if (limit && limit > 0) {
    return messages.slice(-limit);
  }

  return messages;
}

// Get conversation context (last N messages formatted for API)
export function getConversationContext(
  conversationId: string,
  maxMessages: number = 10
): Array<{ role: string; content: string }> {
  const messages = getMessages(conversationId, maxMessages);

  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

// Update conversation vibe
export function updateConversationVibe(conversationId: string, vibe: VibeMode): Conversation | null {
  const conversation = conversations.get(conversationId);
  if (!conversation) return null;

  conversation.currentVibe = vibe;
  conversation.updatedAt = new Date();

  // Adjust chaos level based on vibe
  const chaosLevels: Record<VibeMode, number> = {
    chaotic: 50,
    soft: 20,
    unhinged: 100,
    study: 35,
  };

  conversation.metadata.chaosLevel = chaosLevels[vibe];

  conversations.set(conversationId, conversation);
  return conversation;
}

// Calculate average response time
export function updateAverageResponseTime(
  conversationId: string,
  responseTime: number
): void {
  const conversation = conversations.get(conversationId);
  if (!conversation) return;

  const currentAvg = conversation.metadata.averageResponseTime;
  const messageCount = conversation.metadata.messageCount;

  // Calculate running average
  const newAvg = ((currentAvg * (messageCount - 1)) + responseTime) / messageCount;
  conversation.metadata.averageResponseTime = newAvg;

  conversations.set(conversationId, conversation);
}

// Get conversation stats
export function getConversationStats(): ConversationStats {
  const allConvos = getAllConversations();

  if (allConvos.length === 0) {
    return {
      totalConversations: 0,
      totalMessages: 0,
      averageVibeScore: 50,
      mostUsedVibe: 'chaotic',
      chaosScore: 0,
    };
  }

  const totalMessages = allConvos.reduce((sum, c) => sum + c.metadata.messageCount, 0);
  const averageVibeScore = allConvos.reduce((sum, c) => sum + c.vibeScore, 0) / allConvos.length;

  // Find most used vibe
  const vibeCounts: Record<VibeMode, number> = {
    chaotic: 0,
    soft: 0,
    unhinged: 0,
    study: 0,
  };

  allConvos.forEach(c => {
    vibeCounts[c.currentVibe]++;
  });

  const mostUsedVibe = Object.entries(vibeCounts).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0] as VibeMode;

  const chaosScore = allConvos.reduce((sum, c) => sum + c.metadata.chaosLevel, 0) / allConvos.length;

  return {
    totalConversations: allConvos.length,
    totalMessages,
    averageVibeScore,
    mostUsedVibe,
    chaosScore,
  };
}

// Search conversations by title or content
export function searchConversations(query: string): Conversation[] {
  const lowerQuery = query.toLowerCase();

  return getAllConversations().filter(convo => {
    // Search in title
    if (convo.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search in messages
    return convo.messages.some(msg =>
      msg.content.toLowerCase().includes(lowerQuery)
    );
  });
}

// Clean up old conversations (optional, for memory management)
export function cleanupOldConversations(daysOld: number = 30): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  let deletedCount = 0;

  for (const [id, convo] of conversations.entries()) {
    if (convo.updatedAt < cutoffDate) {
      conversations.delete(id);
      deletedCount++;
    }
  }

  return deletedCount;
}

// Export conversation to JSON
export function exportConversation(conversationId: string): string | null {
  const conversation = conversations.get(conversationId);
  if (!conversation) return null;

  return JSON.stringify(conversation, null, 2);
}

// Import conversation from JSON
export function importConversation(jsonData: string): Conversation | null {
  try {
    const data = JSON.parse(jsonData);

    // Validate structure
    if (!data.id || !data.messages || !Array.isArray(data.messages)) {
      return null;
    }

    // Generate new ID to avoid conflicts
    const newId = generateId();
    const conversation: Conversation = {
      ...data,
      id: newId,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(),
      messages: data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    };

    conversations.set(newId, conversation);
    return conversation;
  } catch (error) {
    console.error('Failed to import conversation:', error);
    return null;
  }
}

// Get conversation duration in milliseconds
export function getConversationDuration(conversationId: string): number {
  const conversation = conversations.get(conversationId);
  if (!conversation || conversation.messages.length === 0) {
    return 0;
  }

  const firstMessage = conversation.messages[0];
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime();
}

// Check if conversation needs a break reminder
export function needsBreakReminder(conversationId: string): boolean {
  const conversation = conversations.get(conversationId);
  if (!conversation) return false;

  const duration = getConversationDuration(conversationId);
  const messageCount = conversation.metadata.messageCount;

  // Suggest break after 50 messages or 2 hours
  return messageCount > 50 || duration > 7200000;
}
