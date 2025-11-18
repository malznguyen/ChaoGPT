'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, VibeMode, StreamChunk } from '@/lib/types';

interface UseChatOptions {
  conversationId?: string;
  vibe?: VibeMode;
  onError?: (error: Error) => void;
  onComplete?: (message: Message) => void;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (message: string) => Promise<void>;
  currentVibe: VibeMode;
  setVibe: (vibe: VibeMode) => void;
  conversationId: string | null;
  isStreaming: boolean;
  abort: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    conversationId: initialConversationId,
    vibe: initialVibe = 'chaotic',
    onError,
    onComplete,
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentVibe, setCurrentVibe] = useState<VibeMode>(initialVibe);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageRef = useRef<string>('');

  // Abort ongoing request
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, []);

  // Parse SSE data
  const parseSSE = (line: string): StreamChunk | null => {
    if (line.startsWith('data: ')) {
      try {
        return JSON.parse(line.slice(6)) as StreamChunk;
      } catch (e) {
        console.error('Failed to parse SSE data:', e);
        return null;
      }
    }
    return null;
  };

  // Send message and handle streaming response
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      // Abort any ongoing request
      abort();

      setIsLoading(true);
      setError(null);
      currentMessageRef.current = '';

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Add user message optimistically
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
        vibe: currentVibe,
        reactions: [],
        tokens: 0,
        metadata: {
          model: 'user',
          temperature: 0,
          wasChaoticResponse: false,
        },
      };

      setMessages(prev => [...prev, userMessage]);

      // Prepare assistant message placeholder
      const assistantMessageId = `assistant-${Date.now()}`;
      let assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        vibe: currentVibe,
        reactions: [],
        tokens: 0,
        metadata: {
          model: 'gpt-4o',
          temperature: 0.9,
          wasChaoticResponse: currentVibe === 'chaotic' || currentVibe === 'unhinged',
        },
      };

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            conversationId,
            vibe: currentVibe,
          }),
          signal: abortControllerRef.current.signal,
        });

        // Get conversation ID from headers
        const newConversationId = response.headers.get('x-conversation-id');
        if (newConversationId && !conversationId) {
          setConversationId(newConversationId);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Request failed');
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        setIsStreaming(true);

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Add empty assistant message
        setMessages(prev => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const chunk = parseSSE(line);

            if (!chunk) continue;

            switch (chunk.type) {
              case 'content':
                if (chunk.token) {
                  currentMessageRef.current += chunk.token;
                  assistantMessage = {
                    ...assistantMessage,
                    content: currentMessageRef.current,
                  };

                  // Update message in state
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessageId ? assistantMessage : msg
                    )
                  );
                }
                break;

              case 'reaction':
                if (chunk.reaction) {
                  assistantMessage.reactions.push(chunk.reaction);
                }
                break;

              case 'emotion':
                if (chunk.emotion) {
                  assistantMessage.metadata.emotionalTone = chunk.emotion as any;
                }
                break;

              case 'end':
                // Stream complete
                setIsStreaming(false);
                setIsLoading(false);

                // Final update
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId ? assistantMessage : msg
                  )
                );

                if (onComplete) {
                  onComplete(assistantMessage);
                }
                break;

              case 'error':
                throw new Error(chunk.error || 'Streaming error');
            }
          }
        }

        setIsStreaming(false);
        setIsLoading(false);

      } catch (err) {
        const error = err as Error;

        // Don't treat abort as error
        if (error.name === 'AbortError') {
          console.log('Request aborted');
          return;
        }

        console.error('Chat error:', error);
        setError(error);
        setIsLoading(false);
        setIsStreaming(false);

        // Remove incomplete assistant message
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));

        if (onError) {
          onError(error);
        }
      } finally {
        abortControllerRef.current = null;
        currentMessageRef.current = '';
      }
    },
    [conversationId, currentVibe, abort, onComplete, onError]
  );

  // Set vibe and update conversation
  const setVibe = useCallback(
    async (newVibe: VibeMode) => {
      setCurrentVibe(newVibe);

      // If we have a conversation, update it on the server
      if (conversationId) {
        try {
          await fetch('/api/vibe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversationId,
              vibe: newVibe,
            }),
          });
        } catch (err) {
          console.error('Failed to update vibe on server:', err);
          // Don't fail the UI update
        }
      }
    },
    [conversationId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    currentVibe,
    setVibe,
    conversationId,
    isStreaming,
    abort,
  };
}
