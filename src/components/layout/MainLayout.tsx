'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '@/store/chatStore'
import ChatHistory from '../chat/ChatHistory'
import ChatPanel from '../chat/ChatPanel'
import MessageInput from '../chat/MessageInput'
import VibeControl from '../vibe/VibeControl'

export default function MainLayout() {
  const [showScanline, setShowScanline] = useState(false)
  const { reduceMotion } = useChatStore()

  // Random scanline effect every 30-60 seconds
  useEffect(() => {
    if (reduceMotion) return

    const scheduleScanline = () => {
      const delay = Math.random() * 30000 + 30000 // 30-60 seconds
      setTimeout(() => {
        setShowScanline(true)
        setTimeout(() => setShowScanline(false), 8000)
        scheduleScanline()
      }, delay)
    }

    scheduleScanline()
  }, [reduceMotion])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient mesh */}
      <div className="gradient-mesh" />

      {/* Floating chaos orbs */}
      <div
        className="chaos-orb"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(191, 255, 0, 0.2) 0%, transparent 70%)',
          top: '10%',
          left: '5%',
        }}
      />
      <div
        className="chaos-orb"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 0, 110, 0.15) 0%, transparent 70%)',
          top: '60%',
          right: '10%',
          animationDelay: '5s',
        }}
      />
      <div
        className="chaos-orb"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(139, 57, 255, 0.1) 0%, transparent 70%)',
          bottom: '10%',
          left: '30%',
          animationDelay: '10s',
        }}
      />

      {/* Scanline effect */}
      {showScanline && <div className="scanline" />}

      {/* Main layout grid */}
      <div className="relative z-10 flex h-screen">
        {/* Left Sidebar - Tilted for that chaos energy */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="hidden lg:block relative w-[20%] min-w-[250px] max-w-[300px]"
          style={{
            transform: 'rotate(-2deg)',
            transformOrigin: 'top left',
            marginTop: '1rem',
          }}
        >
          <div
            className="h-full"
            style={{
              transform: 'rotate(2deg)', // Counter-rotate the content
            }}
          >
            <ChatHistory />
          </div>
        </motion.div>

        {/* Center - Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-full lg:max-w-[65%] mx-auto px-4 py-6">
          {/* Header with Logo */}
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 text-center"
          >
            <h1
              className="text-4xl md:text-5xl font-bold lowercase tracking-tight text-gradient-neon"
              style={{ fontFamily: 'var(--font-header)' }}
            >
              chaogpt
            </h1>
            <p className="text-sm text-[var(--off-white)] opacity-70 mt-2 lowercase">
              your unhinged ai bestie (fr fr)
            </p>
          </motion.header>

          {/* Chat Messages Area */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1 overflow-hidden"
          >
            <ChatPanel />
          </motion.div>

          {/* Message Input */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4"
          >
            <MessageInput />
          </motion.div>
        </div>

        {/* Right Panel - Vibe Control Center */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden xl:block w-[15%] min-w-[200px] max-w-[250px] py-6 pr-4"
        >
          <VibeControl />
        </motion.div>
      </div>
    </div>
  )
}
