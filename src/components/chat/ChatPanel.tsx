'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '@/store/chatStore'
import Message from './Message'

export default function ChatPanel() {
  const { messages, isTyping, reduceMotion } = useChatStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    }
  }, [messages, shouldAutoScroll, reduceMotion])

  // Check if user is scrolled to bottom
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
      setShouldAutoScroll(isAtBottom)
    }
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Messages container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        style={{
          scrollBehavior: reduceMotion ? 'auto' : 'smooth',
        }}
      >
        {messages.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center text-center"
          >
            <div className="text-6xl mb-4 animate-[float_3s_ease-in-out_infinite]">💬</div>
            <h2
              className="text-2xl font-bold lowercase mb-2 text-gradient-neon"
              style={{ fontFamily: 'var(--font-header)' }}
            >
              no messages yet bestie
            </h2>
            <p className="text-[var(--off-white)] opacity-70 lowercase max-w-md">
              drop a message and let's get this chaos started. i'm ready for whatever
              unhinged thoughts you got
            </p>
          </motion.div>
        ) : (
          // Messages list
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <Message key={message.id} message={message} index={index} />
            ))}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 px-4"
          >
            <div className="text-2xl">🤖</div>
            <div className="flex gap-1">
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full bg-[var(--electric-lime)]"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-[var(--electric-lime)]"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-[var(--electric-lime)]"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {!shouldAutoScroll && messages.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => {
              setShouldAutoScroll(true)
              scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
              })
            }}
            className="absolute bottom-4 right-4 btn-squish
              px-4 py-2 rounded-full
              bg-[var(--electric-lime)] text-[var(--deep-black)]
              font-bold lowercase shadow-lg
              hover:scale-110 transition-transform"
          >
            ⬇️ new messages
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
