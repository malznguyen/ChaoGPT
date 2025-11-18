'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Message as MessageType } from '@/types/chat'
import { useChatStore } from '@/store/chatStore'

interface MessageProps {
  message: MessageType
  index: number
}

export default function Message({ message, index }: MessageProps) {
  const { reduceMotion, chaosLevel } = useChatStore()
  const [shouldGlitch, setShouldGlitch] = useState(false)
  const messageRef = useRef<HTMLDivElement>(null)

  const isUser = message.role === 'user'

  // Random glitch effect based on chaos level
  useEffect(() => {
    if (reduceMotion || chaosLevel === 0) return

    const glitchInterval = setInterval(() => {
      const glitchChance = chaosLevel * 0.02 // 2% per chaos level
      if (Math.random() < glitchChance) {
        setShouldGlitch(true)
        setTimeout(() => setShouldGlitch(false), 300)
      }
    }, 5000)

    return () => clearInterval(glitchInterval)
  }, [chaosLevel, reduceMotion])

  // Random slide direction for animation
  const randomSlideX = Math.random() * 40 - 20 // -20 to 20
  const randomSlideY = Math.random() * 40 - 20 // -20 to 20
  const randomRotate = Math.random() * 4 - 2 // -2 to 2 degrees

  return (
    <motion.div
      ref={messageRef}
      initial={{
        opacity: 0,
        x: randomSlideX,
        y: randomSlideY,
        rotate: randomRotate,
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
      }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.4,
        ease: [0.68, -0.55, 0.265, 1.55],
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`
          relative max-w-[80%] px-4 py-3
          ${shouldGlitch ? 'glitch-effect' : ''}
          ${reduceMotion ? '' : 'hover:scale-[1.02] transition-transform'}
        `}
        style={{
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* Message bubble with asymmetric styling */}
        {isUser ? (
          // User message - neon gradient border with sharp corners
          <div
            className="relative"
            style={{
              background: 'rgba(10, 10, 10, 0.6)',
              borderRadius: '1.5rem 0.25rem 1.5rem 0.25rem',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(rgba(10, 10, 10, 0.8), rgba(10, 10, 10, 0.8)), linear-gradient(135deg, var(--electric-lime), var(--hot-magenta))',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}
          >
            <p className="text-[var(--off-white)] text-sm md:text-base leading-relaxed">
              {message.content}
            </p>

            {/* Timestamp */}
            <div className="text-xs opacity-50 mt-2 text-right">
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        ) : (
          // AI message - irregular speech bubble
          <div
            className="relative"
            style={{
              background: 'rgba(191, 255, 0, 0.05)',
              borderRadius: '0.25rem 1.5rem 0.25rem 1.5rem',
              border: '2px solid rgba(191, 255, 0, 0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* AI indicator emoji */}
            <div className="absolute -left-8 top-2 text-2xl">🤖</div>

            <p className="text-[var(--off-white)] text-sm md:text-base leading-relaxed">
              {message.content}
            </p>

            {/* Timestamp */}
            <div className="text-xs opacity-50 mt-2">
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        )}

        {/* Random decorative element - occasionally appears */}
        {!reduceMotion && Math.random() > 0.7 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className={`absolute ${isUser ? '-left-6' : '-right-6'} top-0 text-2xl`}
          >
            {getRandomEmoji()}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Helper function to format timestamp
function formatTimestamp(timestamp: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return 'last week sometime idk'
}

// Random decorative emojis
function getRandomEmoji(): string {
  const emojis = ['✨', '💫', '⚡', '🔥', '💀', '👀', '💅', '🎭']
  return emojis[Math.floor(Math.random() * emojis.length)]
}
