# ChaoGPT 🌪️✨

> your unhinged ai bestie (fr fr no cap)

A neo-brutalist Y2K chaos machine UI that looks like Discord and MySpace had a baby raised by TikTok. This is NOT a clean corporate ChatGPT clone - this is a terminally online bestie with aggressive personality.

## 🎨 Design Philosophy

ChaoGPT embraces controlled chaos:
- **Neo-brutalist aesthetics** with sharp edges and asymmetric layouts
- **Y2K/Vaporwave color palette** that screams "I'm not like other AIs"
- **Aggressive animations** that respect user preferences
- **Terminal online energy** with lowercase everything and internet slang
- **Maximum personality** while maintaining functionality

## 🎭 Features

### Core UI Components
- **Tilted Sidebar** - 2-degree rotation for that chaos energy
- **Asymmetric Message Bubbles** - User messages with neon gradient borders, AI messages with irregular shapes
- **Warped Input Box** - Irregular border-radius that looks hand-drawn
- **Vibe Control Center** - Real-time chaos level adjustment
- **Glitch Effects** - Random UI glitches based on chaos level
- **Rotating Placeholders** - Input suggestions that change every 3 seconds

### Special Effects
- 🌈 **Gradient mesh backgrounds** with floating orbs
- ⚡ **Random glitch animations** on messages
- 📺 **Scanline effects** that appear every 30-60 seconds
- 🎨 **Neon glow shadows** on active elements
- 💫 **Smooth slide-in animations** from random angles
- 🔥 **RAGE MODE** detection when typing in ALL CAPS

### Vibe Modes
- **Chaotic** (default) - Standard chaos energy
- **Soft Hours** - Slower animations, gentler vibes
- **Unhinged** - Maximum overdrive, animations at 2x speed
- **Study Buddy** - Minimal animations for focus

### Themes
- **Goblin Mode** (default) - Dark theme with electric lime accents
- **Touch Grass** - Light theme for daytime use
- **Delulu** - High contrast mode with hot magenta

### Accessibility
- ♿ **Reduce Chaos Mode** - Disables animations for motion sensitivity
- 🎯 **WCAG AA** contrast ratios maintained
- ⌨️ **Keyboard navigation** fully supported
- 🎨 **Respects** `prefers-reduced-motion`

## 🚀 Tech Stack

- **Next.js 16** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Framer Motion** for buttery smooth animations
- **Zustand** for state management with persistence
- **Lucide Icons** for consistent iconography

## 📦 Installation

```bash
# clone the repo
git clone <your-repo-url>
cd ChaoGPT

# install dependencies
npm install

# run development server
npm run dev

# build for production
npm run build

# start production server
npm start
```

## 🎮 Usage

### Starting a Chat
1. The app auto-creates your first chat
2. Type in the warped input box (placeholders rotate every 3 seconds)
3. Press Enter to send (Shift+Enter for new line)
4. Watch messages slide in from random angles

### Adjusting the Vibe
1. Use the **Vibe Control Center** (right panel on desktop)
2. Select a vibe mode: chaotic, soft hours, unhinged, or study buddy
3. Adjust **Chaos Level** slider (0-3) to control animation intensity
4. Switch themes between goblin mode, touch grass, or delulu

### Managing Chats
- Click **New Chat** to start fresh (gets random emoji)
- Search chats using the search bar (placeholder text rotates)
- Hover over chat items to see the vibrate effect
- Delete chats with the trash icon (shows on hover)

### Easter Eggs
- Type in ALL CAPS to trigger **RAGE MODE** with shake animation
- Message send button morphs: ✈️ → 🚀 → 💥
- Random emojis appear next to messages
- Chaos orbs float in the background

## 🎨 Color Palette

```css
--electric-lime: #BFFF00  /* Primary - toxic attention-grabbing green */
--hot-magenta: #FF006E    /* Secondary - unhinged pink energy */
--cyber-purple: #8B39FF   /* Accent - vaporwave vibes */
--deep-black: #0A0A0A     /* Background - pure chaos canvas */
--off-white: #F7F7F7      /* Text - easy on the eyes */
--blazing-orange: #FF4500 /* Error - reddit orange energy */
```

## 📱 Responsive Design

- **Mobile (<768px)**: Stacked layout, vibe panel accessible via button
- **Tablet (768-1024px)**: Sidebar and main panel visible
- **Desktop (>1024px)**: Full chaos layout with all three panels

## 🛠️ Customization

### Adjusting Chaos Level Programmatically
```typescript
import { useChatStore } from '@/store/chatStore'

const { setChaosLevel } = useChatStore()
setChaosLevel(2.5) // Range: 0-3
```

### Adding Custom Vibe Modes
Edit `/src/config/design-system.ts`:
```typescript
export const vibes = {
  custom: {
    animationSpeed: 1.5,
    glitchFrequency: 'medium',
    emoji: '🎨',
  },
}
```

### Modifying Color Scheme
Update CSS variables in `/src/app/globals.css`:
```css
:root {
  --electric-lime: #YOUR_COLOR;
  --hot-magenta: #YOUR_COLOR;
  /* etc */
}
```

## 🔮 Future Features (To Be Implemented)

- [ ] Actual OpenAI API integration (v98store.com endpoint)
- [ ] File attachments with drag & drop
- [ ] Screenshot mode with fake Twitter UI wrapper
- [ ] Konami code for "Maximum Overdrive" mode
- [ ] Sound effects for keyboard navigation
- [ ] Cursor trail effects
- [ ] Message reactions and emoji responses
- [ ] Export chat history
- [ ] Dark mode auto-switching based on time (3am sleep suggestions)

## 🎯 Design Notes

### Why Lowercase Everything?
Modern internet aesthetics. Capital letters are for shouting or EMPHASIS only. This creates a casual, friendly tone that matches the "terminally online bestie" personality.

### Why the Chaos?
Traditional AI interfaces are sterile and corporate. ChaoGPT embraces personality, making AI interaction feel like chatting with your most chaotic friend at 2am who somehow knows everything but explains it through memes.

### Why the Tilted Sidebar?
Breaking the rigid grid creates visual interest and reinforces the "unhinged" aesthetic. The 2-degree rotation is subtle enough to avoid usability issues while being noticeable enough to add character.

### Accessibility Balance
Despite the chaos, we maintain WCAG AA standards and provide a "Reduce Chaos" mode. Chaos should be optional, not mandatory. Everyone deserves to enjoy the vibe, regardless of motion sensitivity.

## 📁 Project Structure

```
chaogpt/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── page.tsx           # Main page (renders MainLayout)
│   │   └── globals.css        # Global styles with animations
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   │   └── MainLayout.tsx # Main app layout with grid
│   │   ├── chat/              # Chat-related components
│   │   │   ├── ChatPanel.tsx  # Message display area
│   │   │   ├── Message.tsx    # Individual message bubble
│   │   │   ├── MessageInput.tsx # Input with warped border
│   │   │   └── ChatHistory.tsx # Sidebar with chat list
│   │   └── vibe/              # Vibe control components
│   │       └── VibeControl.tsx # Right panel controls
│   ├── store/
│   │   └── chatStore.ts       # Zustand store with persistence
│   ├── config/
│   │   ├── api.ts             # API configuration
│   │   └── design-system.ts   # Design tokens and constants
│   ├── lib/
│   │   └── api.ts             # API utilities
│   └── types/
│       └── chat.ts            # TypeScript type definitions
└── public/                     # Static assets
```

## 📝 License

MIT License - Go wild, build something chaotic

## 🤝 Contributing

This is art. This is chaos. This is beautiful. If you want to add more unhinged features, PRs welcome fr fr.

## 💬 Credits

Designed and built with love, energy drinks, and way too much internet exposure.

Made for those who think ChatGPT needs more personality 💅✨

---

**remember:** touch grass occasionally bestie 🌱

*no cap this is the best AI assistant fr fr*
