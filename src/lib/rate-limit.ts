// Rate limiting and spam detection

import { RateLimitInfo } from './types';

interface SessionData {
  requests: number[];
  chaosScore: number;
  lastRequest: number;
}

// In-memory store for rate limiting (use Redis in production)
const sessions = new Map<string, SessionData>();

const RATE_LIMIT = 20; // requests per window
const WINDOW_MS = 60 * 1000; // 1 minute
const SPAM_THRESHOLD = 50; // chaos score threshold

export function getSessionId(request: Request): string {
  // Get IP from headers or generate a session ID
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0] || 'anonymous';
  return `session_${ip}`;
}

export function checkRateLimit(sessionId: string): RateLimitInfo {
  const now = Date.now();
  const session = sessions.get(sessionId);

  if (!session) {
    return {
      remaining: RATE_LIMIT - 1,
      limit: RATE_LIMIT,
      resetAt: new Date(now + WINDOW_MS),
      isLimited: false,
    };
  }

  // Remove old requests outside the window
  const recentRequests = session.requests.filter(
    (timestamp) => now - timestamp < WINDOW_MS
  );

  const remaining = Math.max(0, RATE_LIMIT - recentRequests.length);
  const oldestRequest = recentRequests[0] || now;
  const resetAt = new Date(oldestRequest + WINDOW_MS);

  return {
    remaining,
    limit: RATE_LIMIT,
    resetAt,
    isLimited: remaining === 0,
  };
}

export function recordRequest(sessionId: string): void {
  const now = Date.now();
  const session = sessions.get(sessionId) || {
    requests: [],
    chaosScore: 0,
    lastRequest: now,
  };

  session.requests.push(now);
  session.lastRequest = now;

  // Clean up old requests
  session.requests = session.requests.filter(
    (timestamp) => now - timestamp < WINDOW_MS
  );

  sessions.set(sessionId, session);
}

export function isRateLimited(sessionId: string): boolean {
  const info = checkRateLimit(sessionId);
  return info.isLimited;
}

export function createRateLimitResponse(info: RateLimitInfo): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: 'rate_limit_exceeded',
        message: 'whoa slow down bestie, you\'re sending too many messages! take a breath 😅',
        resetAt: info.resetAt.toISOString(),
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': info.limit.toString(),
        'X-RateLimit-Remaining': info.remaining.toString(),
        'X-RateLimit-Reset': info.resetAt.getTime().toString(),
      },
    }
  );
}

export function detectSpam(message: string): boolean {
  // Simple spam detection
  const repeatedChars = /(.)\1{10,}/.test(message);
  const allCaps = message.length > 20 && message === message.toUpperCase();
  const tooManyEmojis = (message.match(/[\p{Emoji}]/gu) || []).length > 20;

  return repeatedChars || allCaps || tooManyEmojis;
}

export function updateChaosScore(
  sessionId: string,
  event: 'spam' | 'normal'
): void {
  const session = sessions.get(sessionId);
  if (!session) return;

  if (event === 'spam') {
    session.chaosScore += 10;
  } else {
    session.chaosScore = Math.max(0, session.chaosScore - 1);
  }

  sessions.set(sessionId, session);
}

export function isSpamming(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  return session ? session.chaosScore >= SPAM_THRESHOLD : false;
}

export function getRateLimitHeaders(info: RateLimitInfo): Record<string, string> {
  return {
    'X-RateLimit-Limit': info.limit.toString(),
    'X-RateLimit-Remaining': info.remaining.toString(),
    'X-RateLimit-Reset': info.resetAt.getTime().toString(),
  };
}
