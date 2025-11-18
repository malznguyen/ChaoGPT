import { create } from 'zustand'

interface ChatStore {
  messages: any[]
  addMessage: (message: any) => void
  currentVibe: 'chaotic' | 'soft' | 'unhinged' | 'study'
  setVibe: (vibe: string) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  currentVibe: 'chaotic',
  setVibe: (vibe) => set({ currentVibe: vibe as any }),
}))
