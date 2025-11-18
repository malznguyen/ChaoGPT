'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Trash2, Edit2 } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'

const searchPlaceholders = [
  'find that unhinged convo...',
  'where did we talk about...',
  'search the lore...',
  'what was that chat...',
]

export default function ChatHistory() {
  const {
    chats,
    activeChat,
    createChat,
    setActiveChat,
    deleteChat,
    reduceMotion,
  } = useChatStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)

  // Rotate search placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % searchPlaceholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto-create first chat if none exist
  useEffect(() => {
    if (chats.length === 0) {
      createChat()
    }
  }, [chats.length, createChat])

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (date: Date) => {
    const now = new Date()
    const chatDate = new Date(date)
    const diff = now.getTime() - chatDate.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days}d ago`
    return 'last week sometime idk'
  }

  return (
    <div className="h-full flex flex-col bg-[var(--deep-black)] bg-opacity-40 backdrop-blur-sm rounded-lg p-4">
      {/* Header */}
      <div className="mb-4">
        <h2
          className="text-xl font-bold lowercase mb-4 text-gradient-neon"
          style={{ fontFamily: 'var(--font-header)' }}
        >
          chat history
        </h2>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--off-white)] opacity-40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholders[currentPlaceholder]}
            className="w-full bg-[var(--deep-black)] bg-opacity-60
              text-[var(--off-white)] text-sm
              placeholder:text-[var(--off-white)] placeholder:opacity-30
              border border-[var(--off-white)] border-opacity-20
              rounded-lg pl-10 pr-3 py-2
              outline-none
              focus:border-[var(--electric-lime)] focus:border-opacity-50
              transition-all lowercase"
          />
        </div>

        {/* New chat button */}
        <motion.button
          onClick={createChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-squish
            bg-[var(--electric-lime)] text-[var(--deep-black)]
            font-bold lowercase rounded-lg py-2 px-3
            flex items-center justify-center gap-2
            hover:shadow-[var(--shadow-neon)]
            transition-all"
        >
          <Plus size={16} />
          <span>new chat</span>
        </motion.button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        <AnimatePresence mode="popLayout">
          {filteredChats.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-[var(--off-white)] opacity-50 text-sm py-8 lowercase"
            >
              {searchQuery ? 'no chats found bestie' : 'no chats yet'}
            </motion.div>
          ) : (
            filteredChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <motion.button
                  onClick={() => setActiveChat(chat.id)}
                  whileHover={
                    reduceMotion
                      ? {}
                      : {
                          x: [0, -2, 2, -2, 2, 0],
                          transition: { duration: 0.3 },
                        }
                  }
                  className={`
                    w-full text-left p-3 rounded-lg
                    transition-all duration-200
                    ${
                      activeChat === chat.id
                        ? 'neon-border bg-[var(--electric-lime)] bg-opacity-10'
                        : 'border border-[var(--off-white)] border-opacity-10 hover:border-opacity-30 hover:bg-[var(--off-white)] hover:bg-opacity-5'
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    {/* Emoji */}
                    <span className="text-xl flex-shrink-0">{chat.emoji}</span>

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div
                        className="text-sm font-medium lowercase truncate mb-1"
                        title={chat.title}
                      >
                        {chat.title}
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs opacity-50 lowercase">
                        {formatDate(chat.createdAt)}
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Delete button (shows on hover) */}
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('delete this chat? (this is permanent bestie)')) {
                      deleteChat(chat.id)
                    }
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded
                    bg-[var(--blazing-orange)] bg-opacity-80
                    opacity-0 group-hover:opacity-100
                    transition-opacity btn-squish"
                >
                  <Trash2 size={12} className="text-[var(--deep-black)]" />
                </motion.button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer stats */}
      <div className="mt-4 pt-4 border-t border-[var(--off-white)] border-opacity-10">
        <div className="text-xs opacity-50 text-center lowercase">
          {chats.length} {chats.length === 1 ? 'chat' : 'chats'} in the archive
        </div>
      </div>
    </div>
  )
}
