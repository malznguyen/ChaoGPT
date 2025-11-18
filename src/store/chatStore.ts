import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Chat, Message } from '@/types/chat'
import { chatEmojis } from '@/config/design-system'

export type Vibe = 'chaotic' | 'soft' | 'unhinged' | 'study'
export type Theme = 'goblin-mode' | 'touch-grass' | 'delulu'

interface ChatStore {
  // Chat management
  chats: Chat[]
  activeChat: string | null
  messages: Message[]

  // Vibe state
  currentVibe: Vibe
  chaosLevel: number

  // Theme management
  theme: Theme

  // UI state
  isTyping: boolean
  reduceMotion: boolean
  screenshotMode: boolean

  // Actions - Chat
  createChat: () => void
  setActiveChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateChatTitle: (chatId: string, title: string) => void

  // Actions - Vibe
  setVibe: (vibe: Vibe) => void
  setChaosLevel: (level: number) => void

  // Actions - Theme
  setTheme: (theme: Theme) => void
  toggleReduceMotion: () => void
  toggleScreenshotMode: () => void

  // Actions - UI
  setIsTyping: (isTyping: boolean) => void
}

const getRandomEmoji = () => {
  return chatEmojis[Math.floor(Math.random() * chatEmojis.length)]
}

const generateChatId = () => {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      activeChat: null,
      messages: [],
      currentVibe: 'chaotic',
      chaosLevel: 1,
      theme: 'goblin-mode',
      isTyping: false,
      reduceMotion: false,
      screenshotMode: false,

      // Chat actions
      createChat: () => {
        const newChat: Chat = {
          id: generateChatId(),
          title: 'new chat session',
          messages: [],
          createdAt: new Date(),
          emoji: getRandomEmoji(),
          vibeCheck: 0,
        }

        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChat: newChat.id,
          messages: [],
        }))
      },

      setActiveChat: (chatId: string) => {
        const chat = get().chats.find((c) => c.id === chatId)
        if (chat) {
          set({
            activeChat: chatId,
            messages: chat.messages,
          })
        }
      },

      deleteChat: (chatId: string) => {
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
          activeChat: state.activeChat === chatId ? null : state.activeChat,
          messages: state.activeChat === chatId ? [] : state.messages,
        }))
      },

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: generateMessageId(),
          timestamp: new Date(),
        }

        set((state) => {
          const updatedMessages = [...state.messages, newMessage]
          const activeChatId = state.activeChat

          // Update messages in the active chat
          const updatedChats = state.chats.map((chat) =>
            chat.id === activeChatId
              ? { ...chat, messages: updatedMessages }
              : chat
          )

          return {
            messages: updatedMessages,
            chats: updatedChats,
          }
        })
      },

      updateChatTitle: (chatId: string, title: string) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, title } : chat
          ),
        }))
      },

      // Vibe actions
      setVibe: (vibe: Vibe) => {
        set({ currentVibe: vibe })
      },

      setChaosLevel: (level: number) => {
        // Clamp between 0 and 3
        const clampedLevel = Math.max(0, Math.min(3, level))
        set({ chaosLevel: clampedLevel })

        // Update CSS variable
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--chaos-intensity', clampedLevel.toString())
        }
      },

      // Theme actions
      setTheme: (theme: Theme) => {
        set({ theme })

        // Update data-theme attribute on document
        if (typeof document !== 'undefined') {
          const themeMap = {
            'goblin-mode': 'goblin-mode',
            'touch-grass': 'touch-grass',
            'delulu': 'delulu',
          }
          document.documentElement.setAttribute('data-theme', themeMap[theme] || 'goblin-mode')
        }
      },

      toggleReduceMotion: () => {
        set((state) => ({ reduceMotion: !state.reduceMotion }))
      },

      toggleScreenshotMode: () => {
        set((state) => ({ screenshotMode: !state.screenshotMode }))
      },

      // UI actions
      setIsTyping: (isTyping: boolean) => {
        set({ isTyping })
      },
    }),
    {
      name: 'chaogpt-storage',
      partialize: (state) => ({
        chats: state.chats,
        theme: state.theme,
        currentVibe: state.currentVibe,
        chaosLevel: state.chaosLevel,
        reduceMotion: state.reduceMotion,
      }),
    }
  )
)
