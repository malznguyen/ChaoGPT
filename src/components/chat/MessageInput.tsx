'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { placeholderTexts } from '@/config/design-system'

export default function MessageInput() {
  const [input, setInput] = useState('')
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isAllCaps, setIsAllCaps] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { addMessage, setIsTyping, reduceMotion, chaosLevel } = useChatStore()

  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholderTexts.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Check for ALL CAPS rage
  useEffect(() => {
    const upperCaseCount = (input.match(/[A-Z]/g) || []).length
    const totalLetters = (input.match(/[A-Za-z]/g) || []).length
    setIsAllCaps(totalLetters > 5 && upperCaseCount / totalLetters > 0.7)
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    addMessage({
      role: 'user',
      content: input,
    })

    // Clear input
    setInput('')
    setIsAllCaps(false)

    // Simulate AI typing (this will be replaced with actual API call)
    setIsTyping(true)
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: 'yooo that\'s wild bestie, let me think about that for a sec... 🤔',
      })
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Character count and progress
  const maxChars = 2000
  const charCount = input.length
  const progress = (charCount / maxChars) * 100

  // Send button emoji based on hover
  const getSendEmoji = () => {
    if (!input.trim()) return '✈️'
    if (isAllCaps) return '💥'
    if (isHovering) return '🚀'
    return '✈️'
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Rage shake warning */}
      <AnimatePresence>
        {isAllCaps && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-12 left-0 right-0 text-center"
          >
            <span className="text-sm bg-[var(--blazing-orange)] text-[var(--deep-black)] px-3 py-1 rounded-full font-bold">
              📢 detected: RAGE MODE ACTIVATED
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input container with warped border */}
      <div
        className={`
          relative p-4
          bg-[var(--deep-black)] bg-opacity-60
          backdrop-blur-md
          border-2
          transition-all duration-300
          ${isAllCaps ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''}
          ${input.trim() ? 'border-[var(--electric-lime)]' : 'border-[var(--off-white)] border-opacity-20'}
        `}
        style={{
          borderRadius: '47% 53% 44% 56% / 62% 46% 54% 38%',
          boxShadow: input.trim() ? 'var(--shadow-neon)' : 'none',
        }}
      >
        <div className="flex items-end gap-3">
          {/* Attachment button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="btn-squish p-2 rounded-lg hover:bg-[var(--electric-lime)] hover:bg-opacity-10 transition-colors"
            title="attach something (not implemented yet lol)"
          >
            <Paperclip size={20} className="text-[var(--electric-lime)]" />
          </motion.button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholderTexts[currentPlaceholder]}
              className="w-full bg-transparent text-[var(--off-white)]
                placeholder:text-[var(--off-white)] placeholder:opacity-40
                resize-none outline-none min-h-[60px] max-h-[200px]
                font-mono text-sm md:text-base"
              style={{
                fontFamily: 'var(--font-body)',
              }}
              maxLength={maxChars}
            />

            {/* Character counter progress bar */}
            {charCount > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--deep-black)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full"
                  style={{
                    background: `linear-gradient(90deg, var(--electric-lime) 0%, var(--hot-magenta) 100%)`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Send button with morphing emoji */}
          <motion.button
            type="submit"
            disabled={!input.trim()}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            whileHover={{ scale: input.trim() ? 1.1 : 1 }}
            whileTap={{ scale: input.trim() ? 0.9 : 1 }}
            className={`
              btn-squish p-3 rounded-lg font-bold
              transition-all duration-200
              ${
                input.trim()
                  ? 'bg-[var(--electric-lime)] text-[var(--deep-black)] hover:shadow-[var(--shadow-neon)] cursor-pointer'
                  : 'bg-[var(--off-white)] bg-opacity-10 text-[var(--off-white)] opacity-50 cursor-not-allowed'
              }
            `}
          >
            <motion.span
              key={getSendEmoji()}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="text-xl"
            >
              {getSendEmoji()}
            </motion.span>
          </motion.button>
        </div>

        {/* Character count indicator */}
        {charCount > maxChars * 0.8 && (
          <div className="text-xs text-right mt-2 opacity-50">
            {charCount} / {maxChars}
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="text-xs opacity-40 mt-2 text-center lowercase">
        press enter to send • shift+enter for new line
      </div>
    </form>
  )
}
