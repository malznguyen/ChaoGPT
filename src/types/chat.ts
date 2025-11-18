export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  vibe?: string
  reactions?: string[]
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  emoji: string
  vibeCheck: number
}
