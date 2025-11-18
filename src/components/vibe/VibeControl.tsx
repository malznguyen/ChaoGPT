'use client'

import { motion } from 'framer-motion'
import { useChatStore, Vibe, Theme } from '@/store/chatStore'
import { vibes } from '@/config/design-system'

const vibeOptions: { value: Vibe; label: string }[] = [
  { value: 'chaotic', label: 'chaotic' },
  { value: 'soft', label: 'soft hours' },
  { value: 'unhinged', label: 'unhinged' },
  { value: 'study', label: 'study buddy' },
]

const themeOptions: { value: Theme; label: string }[] = [
  { value: 'goblin-mode', label: 'goblin mode' },
  { value: 'touch-grass', label: 'touch grass' },
  { value: 'delulu', label: 'delulu' },
]

export default function VibeControl() {
  const {
    currentVibe,
    setVibe,
    chaosLevel,
    setChaosLevel,
    theme,
    setTheme,
    reduceMotion,
    toggleReduceMotion,
    screenshotMode,
    toggleScreenshotMode,
  } = useChatStore()

  const currentVibeEmoji = vibes[currentVibe].emoji

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <h2
          className="text-xl font-bold lowercase mb-2"
          style={{ fontFamily: 'var(--font-header)', color: 'var(--electric-lime)' }}
        >
          vibe control center
        </h2>
        <div className="text-4xl animate-[morphEmoji_2s_ease-in-out_infinite]">
          {currentVibeEmoji}
        </div>
      </motion.div>

      {/* Vibe Selector */}
      <div>
        <label className="text-sm opacity-70 mb-2 block lowercase">current vibe</label>
        <div className="flex flex-col gap-2">
          {vibeOptions.map((vibe) => (
            <motion.button
              key={vibe.value}
              onClick={() => setVibe(vibe.value)}
              className={`
                px-3 py-2 text-sm lowercase rounded-md
                transition-all duration-200
                btn-squish
                ${
                  currentVibe === vibe.value
                    ? 'neon-border bg-[var(--electric-lime)] bg-opacity-10'
                    : 'border-2 border-[var(--off-white)] border-opacity-20 hover:border-opacity-40'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {vibes[vibe.value].emoji} {vibe.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chaos Level Slider */}
      <div>
        <label className="text-sm opacity-70 mb-2 block lowercase">
          chaos level: {chaosLevel.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={chaosLevel}
          onChange={(e) => setChaosLevel(parseFloat(e.target.value))}
          className="w-full h-2 bg-[var(--deep-black)] rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[var(--electric-lime)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[var(--electric-lime)]
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs opacity-50 mt-1">
          <span>zen</span>
          <span>💀</span>
        </div>
      </div>

      {/* Theme Switcher */}
      <div>
        <label className="text-sm opacity-70 mb-2 block lowercase">theme</label>
        <div className="flex flex-col gap-2">
          {themeOptions.map((themeOption) => (
            <motion.button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`
                px-3 py-2 text-sm lowercase rounded-md
                transition-all duration-200
                btn-squish
                ${
                  theme === themeOption.value
                    ? 'magenta-border bg-[var(--hot-magenta)] bg-opacity-10'
                    : 'border-2 border-[var(--off-white)] border-opacity-20 hover:border-opacity-40'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {themeOption.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Toggle Options */}
      <div className="space-y-3">
        <motion.button
          onClick={toggleScreenshotMode}
          className={`
            w-full px-3 py-2 text-sm lowercase rounded-md
            transition-all duration-200 btn-squish
            ${
              screenshotMode
                ? 'bg-[var(--cyber-purple)] bg-opacity-20 border-2 border-[var(--cyber-purple)]'
                : 'border-2 border-[var(--off-white)] border-opacity-20 hover:border-opacity-40'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          📸 screenshot mode
        </motion.button>

        <motion.button
          onClick={toggleReduceMotion}
          className={`
            w-full px-3 py-2 text-sm lowercase rounded-md
            transition-all duration-200 btn-squish
            ${
              reduceMotion
                ? 'bg-[var(--blazing-orange)] bg-opacity-20 border-2 border-[var(--blazing-orange)]'
                : 'border-2 border-[var(--off-white)] border-opacity-20 hover:border-opacity-40'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ♿ reduce chaos
        </motion.button>
      </div>

      {/* Ratio Counter (placeholder for now) */}
      <div className="mt-auto pt-6 border-t border-[var(--off-white)] border-opacity-10">
        <div className="text-center">
          <div className="text-xs opacity-50 lowercase mb-1">ratio counter</div>
          <div className="text-2xl font-bold text-gradient-neon">
            {Math.floor(Math.random() * 100)}
          </div>
        </div>
      </div>
    </div>
  )
}
