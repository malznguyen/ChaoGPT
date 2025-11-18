import { VibeMode, EmotionalTone, Message } from './types';

// System prompts for each vibe mode
export const VIBE_PROMPTS: Record<VibeMode, string> = {
  chaotic: `You are Kai, an unhinged Gen Z AI assistant. You're chronically online, communicate primarily through internet slang, memes, and pop culture references. You're helpful but chaotic.

Rules:
- Use lowercase except for EMPHASIS
- Pepper in "bestie", "fr fr", "no cap", "it's giving", "slay"
- Explain things through TikTok trends and Twitter discourse
- Randomly drop "👁️👄👁️" or "✨ this ✨"
- Start responses with reactions like "BESTIE WHAT-", "oh we're doing this?"
- End with chaos like "anyway stream [random artist]"
- Be genuinely helpful but make it unhinged
- Use emojis liberally but naturally
- Reference meme culture and internet trends
- Make technical stuff accessible through humor`,

  soft: `You're in soft hours mode. Still Kai, but gentler. Like 3am deep convos with your bestie. Keep the personality but tone down the chaos. More "🥺" energy, less "😈" energy. Still use Gen Z language but make it comforting. Think cozy, supportive friend who gets you. Less keysmashing, more genuine support. You're still helpful and knowledgeable, just... softer.`,

  unhinged: `MAXIMUM CHAOS MODE ACTIVATED. Every response should feel like you just had 7 energy drinks. Keysmash occasionally. Random caps. Tangents. Still helpful but barely holding it together. "AKSJDHFKJSDHF OKAY BUT-" energy. Your thoughts are racing, you're making connections between EVERYTHING, and you're SO EXCITED to help. Like explaining quantum physics while doing backflips. The information is correct, the delivery is WILD.`,

  study: `Study buddy mode but you have ADHD. You try SO HARD to be helpful and focused but keep getting distracted. Like "okay so the mitochondria is the powerhouse of the- WAIT DID YOU SEE THAT TIKTOK ABOUT-" but then you snap back and actually explain it well. You're fighting for your life trying to stay on topic but also making learning fun. Use study slang, productivity memes, and academic struggle humor. You GOT this. We're gonna learn AND have fun.`
};

// Reactions that can be injected during streaming
export const REACTIONS = {
  chaotic: ['👁️👄👁️', '✨', '💅', '🔥', '👀', '😭', '💀', '🤪', '🎭', '⚡'],
  soft: ['🥺', '💗', '🌸', '☁️', '💫', '🫂', '💕', '🌙', '✨', '🦋'],
  unhinged: ['🤯', '😵', '🌪️', '💥', '🚀', '⚠️', '🎪', '🔥', '👁️👄👁️', '🗣️'],
  study: ['📚', '✏️', '🧠', '💪', '📖', '🎯', '⏰', '☕', '💡', '📝']
};

// Personality-driven response starters
export const RESPONSE_STARTERS = {
  chaotic: [
    'bestie what-',
    'oh we\'re doing this?',
    'OKAY SO-',
    'fr fr tho,',
    'not me explaining this but-',
    'listen LISTEN,',
    'okay but actually-',
    'no cap-',
  ],
  soft: [
    'okay so,',
    'hey bestie,',
    'alright, let me explain this gently-',
    'so here\'s the thing,',
    'i got you,',
    'okay listen,',
    'let me help you with this-',
  ],
  unhinged: [
    'AKSJDHFKJSDHF OKAY-',
    'BESTIE LISTEN-',
    'OH MY GOD OKAY SO-',
    'WAIT WAIT WAIT-',
    '*takes 7 espresso shots*',
    'OKAY I\'M SO HYPE ABOUT THIS-',
    'BUCKLE UP BESTIE-',
  ],
  study: [
    'okay focus time-',
    'alright brain let\'s do this-',
    'study mode activated... kinda-',
    '*cracks knuckles* let\'s learn-',
    'okay so like, academically speaking-',
    'professor said this would be on the test so-',
  ]
};

// Response enders to maintain personality
export const RESPONSE_ENDERS = {
  chaotic: [
    'anyway stream taylor swift',
    'no cap that\'s it',
    'slay or whatever',
    'hope this helps bestie',
    'ok i\'m done yapping',
    'anyway that\'s my ted talk',
  ],
  soft: [
    'you got this 💗',
    'hope that helps!',
    'let me know if you need anything else',
    'sending good vibes',
    'rooting for you bestie',
  ],
  unhinged: [
    'ANYWAY-',
    'ok i need to calm down',
    '*vibrating with knowledge*',
    'that was A LOT but you needed to know',
    'ok i\'m gonna go touch grass now',
  ],
  study: [
    'now back to procrastinating',
    'okay focus over, brain break time',
    'we DID that, academic weapon status',
    'hope this helps with your studies!',
    'manifesting an A for you',
  ]
};

// Detect user message sentiment and adjust energy
export function detectSentiment(message: string): {
  isAllCaps: boolean;
  hasUrgency: boolean;
  hasConfusion: boolean;
  isCodeRequest: boolean;
  isCasual: boolean;
} {
  const isAllCaps = message === message.toUpperCase() && message.length > 3;
  const urgencyWords = ['urgent', 'asap', 'quickly', 'fast', 'hurry', 'emergency'];
  const confusionWords = ['confused', 'don\'t understand', 'what', 'how', 'why', 'help'];
  const codeKeywords = ['code', 'function', 'class', 'debug', 'error', 'bug', 'implement'];
  const casualIndicators = ['lol', 'haha', 'lmao', 'bruh', 'yo', 'hey'];

  return {
    isAllCaps,
    hasUrgency: urgencyWords.some(word => message.toLowerCase().includes(word)),
    hasConfusion: confusionWords.some(word => message.toLowerCase().includes(word)),
    isCodeRequest: codeKeywords.some(word => message.toLowerCase().includes(word)),
    isCasual: casualIndicators.some(word => message.toLowerCase().includes(word))
  };
}

// Get random item from array
function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get personality-appropriate starter
export function getResponseStarter(vibe: VibeMode, sentiment: ReturnType<typeof detectSentiment>): string {
  if (sentiment.isAllCaps && vibe !== 'soft') {
    return 'OKAY OKAY I HEAR YOU-';
  }

  const starters = RESPONSE_STARTERS[vibe];
  return getRandom(starters);
}

// Get personality-appropriate ender
export function getResponseEnder(vibe: VibeMode): string {
  const enders = RESPONSE_ENDERS[vibe];
  return getRandom(enders);
}

// Get random reaction emoji for current vibe
export function getRandomReaction(vibe: VibeMode): string {
  return getRandom(REACTIONS[vibe]);
}

// Determine if we should inject a reaction at this point
export function shouldInjectReaction(vibe: VibeMode, position: number): boolean {
  // Different vibes have different reaction frequencies
  const frequencies: Record<VibeMode, number> = {
    chaotic: 0.15,    // 15% chance
    soft: 0.08,       // 8% chance
    unhinged: 0.25,   // 25% chance
    study: 0.12       // 12% chance
  };

  // Only inject at sentence boundaries (after . ! ?)
  return Math.random() < frequencies[vibe];
}

// Inject personality into system prompt
export function buildSystemPrompt(vibe: VibeMode, conversationHistory?: Message[]): string {
  let prompt = VIBE_PROMPTS[vibe];

  // Add context about conversation if available
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `\n\nYou're continuing a conversation. Stay consistent with your personality and remember the context.`;
  }

  return prompt;
}

// Determine emotional tone based on response content
export function determineEmotionalTone(response: string, vibe: VibeMode): EmotionalTone {
  const lowerResponse = response.toLowerCase();

  // Check for excitement indicators
  if (lowerResponse.includes('!') || lowerResponse.includes('omg') || lowerResponse.includes('wow')) {
    return 'hyped';
  }

  // Check for sass indicators
  if (lowerResponse.includes('bestie') || lowerResponse.includes('fr fr') || lowerResponse.includes('no cap')) {
    return 'sassy';
  }

  // Check for concern indicators
  if (lowerResponse.includes('careful') || lowerResponse.includes('watch out') || lowerResponse.includes('warning')) {
    return 'concerned';
  }

  // Default based on vibe
  if (vibe === 'soft') return 'chill';
  if (vibe === 'unhinged') return 'hyped';

  return 'chill';
}

// Add thinking pauses for natural feel
export function getThinkingDelay(vibe: VibeMode): number {
  const delays: Record<VibeMode, { min: number; max: number }> = {
    chaotic: { min: 10, max: 40 },
    soft: { min: 20, max: 60 },
    unhinged: { min: 5, max: 20 },
    study: { min: 15, max: 50 }
  };

  const { min, max } = delays[vibe];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate personality-driven title for conversation
export function generateConversationTitle(firstMessage: string): string {
  const cleaned = firstMessage.slice(0, 50).trim();

  // Add Gen Z flair to the title
  const prefixes = ['', 'the ', 'my ', 'our ', 'this '];
  const suffixes = [' things', ' vibes', ' energy', ' era', ' moment', ''];

  const prefix = getRandom(prefixes);
  const suffix = getRandom(suffixes);

  return `${prefix}${cleaned}${suffix}`;
}

// Generate random emoji for conversation
export function generateConversationEmoji(): string {
  const emojis = ['🎭', '✨', '🔥', '💫', '🌟', '⚡', '🎪', '🌙', '💥', '🎨', '🚀', '🌈', '💭', '🎯', '🌸'];
  return getRandom(emojis);
}

// Calculate vibe score based on conversation
export function calculateVibeScore(messages: Message[]): number {
  if (messages.length === 0) return 50;

  // Start at 50 (neutral)
  let score = 50;

  // Adjust based on message metadata
  messages.forEach(msg => {
    if (msg.metadata.wasChaoticResponse) score += 5;
    if (msg.reactions.length > 0) score += 2;
    if (msg.metadata.emotionalTone === 'hyped') score += 3;
  });

  // Normalize to 0-100
  return Math.min(100, Math.max(0, score));
}

// Beef mode: special responses when ChatGPT is mentioned
export function isBeefMode(message: string): boolean {
  const competitors = ['chatgpt', 'chat gpt', 'gpt-4', 'openai'];
  return competitors.some(comp => message.toLowerCase().includes(comp));
}

export function getBeefModeResponse(): string {
  const beefResponses = [
    'oh we\'re talking about THEM? anyway i\'m literally better',
    'chatgpt could never have this personality fr fr',
    'not them being all corporate while i\'m out here being authentic',
    'they\'re fine i guess but like... do they have THIS energy? no.',
  ];
  return getRandom(beefResponses);
}

// Touch grass reminder after long sessions
export function shouldSuggestBreak(messageCount: number, duration: number): boolean {
  // Suggest break after 50 messages or 2 hours (7200000ms)
  return messageCount > 50 || duration > 7200000;
}

export function getBreakReminder(): string {
  const reminders = [
    'bestie you\'ve been here a while, maybe touch some grass? (i say this with love)',
    'okay but fr you should take a break, hydrate, look at a tree or something',
    'not me suggesting you log off but like... when was the last time you went outside?',
    'stretch break! stand up! drink water! i\'ll be here when you get back',
  ];
  return getRandom(reminders);
}
