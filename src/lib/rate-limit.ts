import { RateLimitInfo } from './types';

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

interface RateLimitEntry {
  count: number;
  resetAt: Date;
  requests: number[];
}

// In-memory storage for rate limits
const rateLimits = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits.entries()) {
    if (entry.resetAt.getTime() < now) {
      rateLimits.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Get or create rate limit entry for session
function getRateLimitEntry(sessionId: string): RateLimitEntry {
  const existing = rateLimits.get(sessionId);

  if (existing && existing.resetAt.getTime() > Date.now()) {
    return existing;
  }

  // Create new entry
  const entry: RateLimitEntry = {
    count: 0,
    resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW),
    requests: [],
  };

  rateLimits.set(sessionId, entry);
  return entry;
}

// Check if request should be rate limited
export function checkRateLimit(sessionId: string): RateLimitInfo {
  const enabled = process.env.RATE_LIMIT_ENABLED !== 'false';

  if (!enabled) {
    return {
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: RATE_LIMIT_MAX_REQUESTS,
      reset: new Date(Date.now() + RATE_LIMIT_WINDOW),
      sessionId,
    };
  }

  const entry = getRateLimitEntry(sessionId);
  const now = Date.now();

  // Remove old requests outside the window
  entry.requests = entry.requests.filter(
    timestamp => timestamp > now - RATE_LIMIT_WINDOW
  );

  entry.count = entry.requests.length;

  return {
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count),
    reset: entry.resetAt,
    sessionId,
  };
}

// Record a request
export function recordRequest(sessionId: string): void {
  const entry = getRateLimitEntry(sessionId);
  entry.requests.push(Date.now());
  entry.count = entry.requests.length;
  rateLimits.set(sessionId, entry);
}

// Check if rate limited
export function isRateLimited(sessionId: string): boolean {
  const info = checkRateLimit(sessionId);
  return info.remaining <= 0;
}

// Get session ID from request headers
export function getSessionId(request: Request): string {
  // Try to get session ID from various headers
  const headers = request.headers;

  // Check for custom session header
  const customSession = headers.get('x-session-id');
  if (customSession) return customSession;

  // Check for authorization header (if using auth)
  const auth = headers.get('authorization');
  if (auth) return `auth:${auth.slice(0, 20)}`;

  // Fall back to IP address
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`;
  }

  // Use a combination of headers as fallback
  const userAgent = headers.get('user-agent') || 'unknown';
  return `ua:${userAgent.slice(0, 50)}`;
}

// Chaos score tracking (for spam detection)
interface ChaosEntry {
  score: number;
  lastUpdate: Date;
  violations: number;
}

const chaosScores = new Map<string, ChaosEntry>();

// Update chaos score based on behavior
export function updateChaosScore(
  sessionId: string,
  behavior: 'normal' | 'spam' | 'abuse'
): number {
  const entry = chaosScores.get(sessionId) || {
    score: 0,
    lastUpdate: new Date(),
    violations: 0,
  };

  const now = new Date();
  const timeDiff = now.getTime() - entry.lastUpdate.getTime();

  // Decay score over time (1 point per minute)
  const decay = Math.floor(timeDiff / 60000);
  entry.score = Math.max(0, entry.score - decay);

  // Update based on behavior
  switch (behavior) {
    case 'spam':
      entry.score += 10;
      entry.violations++;
      break;
    case 'abuse':
      entry.score += 25;
      entry.violations++;
      break;
    case 'normal':
      entry.score = Math.max(0, entry.score - 1);
      break;
  }

  entry.lastUpdate = now;
  chaosScores.set(sessionId, entry);

  return entry.score;
}

// Check if session is spamming
export function isSpamming(sessionId: string): boolean {
  const entry = chaosScores.get(sessionId);
  if (!entry) return false;

  return entry.score > 50 || entry.violations > 5;
}

// Detect spam patterns in message
export function detectSpam(message: string): boolean {
  // Check for repeated characters
  const repeatedChars = /(.)\1{10,}/.test(message);

  // Check for all caps (if message is long)
  const allCaps = message.length > 20 && message === message.toUpperCase();

  // Check for excessive punctuation
  const excessivePunctuation = (message.match(/[!?]{5,}/g) || []).length > 0;

  // Check for very short repeated messages
  const veryShort = message.trim().length < 3;

  return repeatedChars || (allCaps && message.length > 100) || excessivePunctuation || veryShort;
}

// Get rate limit headers for response
export function getRateLimitHeaders(info: RateLimitInfo): Record<string, string> {
  return {
    'X-RateLimit-Limit': info.limit.toString(),
    'X-RateLimit-Remaining': info.remaining.toString(),
    'X-RateLimit-Reset': info.reset.toISOString(),
  };
}

// Create rate limit error response
export function createRateLimitResponse(info: RateLimitInfo): Response {
  const resetIn = Math.ceil((info.reset.getTime() - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: {
        code: 'rate_limit',
        message: "bestie you're doing too much rn, take a breath 😭",
        resetIn,
        resetAt: info.reset.toISOString(),
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(info),
      },
    }
  );
}
