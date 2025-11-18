// ChaoGPT Design System - where chaos meets structure (kinda)

export const colors = {
  // Primary Palette - the unhinged essentials
  electricLime: '#BFFF00',
  hotMagenta: '#FF006E',
  cyberPurple: '#8B39FF',
  deepBlack: '#0A0A0A',
  offWhite: '#F7F7F7',
  blazingOrange: '#FF4500',

  // Gradient stops for that ~aesthetic~
  gradients: {
    neonPulse: 'linear-gradient(135deg, #BFFF00 0%, #FF006E 100%)',
    vibeShift: 'linear-gradient(45deg, #8B39FF 0%, #FF006E 50%, #BFFF00 100%)',
    chaosOrb: 'radial-gradient(circle, rgba(191, 255, 0, 0.2) 0%, rgba(255, 0, 110, 0.1) 100%)',
    meshBackground: 'radial-gradient(at 40% 20%, rgba(139, 57, 255, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(255, 0, 110, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(191, 255, 0, 0.1) 0px, transparent 50%)',
  },

  // Theme variants
  themes: {
    goblinMode: {
      bg: '#0A0A0A',
      text: '#F7F7F7',
      accent: '#BFFF00',
    },
    touchGrass: {
      bg: '#F7F7F7',
      text: '#0A0A0A',
      accent: '#8B39FF',
    },
    delulu: {
      bg: '#000000',
      text: '#FFFFFF',
      accent: '#FF006E',
    },
  },
} as const

export const typography = {
  fonts: {
    header: 'var(--font-space-grotesk)',
    body: 'var(--font-jetbrains-mono)',
    chaos: 'Comic Sans MS, cursive', // for the lolz
  },
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
} as const

export const animations = {
  // Timing functions for that perfect chaos
  timings: {
    instant: '0.1s',
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s',
    dramatic: '1s',
  },

  // Easing curves
  easings: {
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    dramatic: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  },

  // Keyframe names (actual animations in globals.css)
  keyframes: {
    glitch: 'glitch',
    pulse: 'neonPulse',
    float: 'float',
    shake: 'shake',
    spin: 'spin',
    slideInRandom: 'slideInRandom',
    vibrate: 'vibrate',
    morphEmoji: 'morphEmoji',
  },
} as const

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '1rem',
  brutalist: '2px', // sharp and in your face
  asymmetric: {
    topLeft: '1.5rem',
    topRight: '0.25rem',
    bottomRight: '1.5rem',
    bottomLeft: '0.25rem',
  },
  warped: '47% 53% 44% 56% / 62% 46% 54% 38%', // for that warped input box
} as const

export const shadows = {
  neonGlow: '0 0 20px rgba(191, 255, 0, 0.5), 0 0 40px rgba(191, 255, 0, 0.2)',
  magentaGlow: '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.2)',
  purpleGlow: '0 0 20px rgba(139, 57, 255, 0.5), 0 0 40px rgba(139, 57, 255, 0.2)',
  brutalist: '4px 4px 0 rgba(191, 255, 0, 1)',
} as const

export const vibes = {
  chaotic: {
    animationSpeed: 1,
    glitchFrequency: 'medium',
    emoji: '🌪️',
  },
  soft: {
    animationSpeed: 0.5,
    glitchFrequency: 'low',
    emoji: '☁️',
  },
  unhinged: {
    animationSpeed: 2,
    glitchFrequency: 'high',
    emoji: '🔥',
  },
  study: {
    animationSpeed: 0.3,
    glitchFrequency: 'none',
    emoji: '📚',
  },
} as const

// Placeholder text rotation pool
export const placeholderTexts = [
  "spill the tea bestie...",
  "what's the vibe?",
  "unleash your thoughts",
  "sir, this is a wendy's",
  "go off i guess",
  "mic check mic check",
  "bestie what's good",
  "drop the lore",
  "i'm listening fr fr",
  "no cap just facts",
] as const

// Random emojis for chat history
export const chatEmojis = [
  '💀', '✨', '🔥', '💅', '👀', '🎭', '🌈', '⚡', '🎪', '🎨',
  '🚀', '💫', '🌙', '⭐', '🎯', '🎲', '🎮', '🎸', '🎭', '🎪',
] as const
