import { NextRequest } from 'next/server';
import { HealthStatus } from '@/lib/types';
import { checkAPIHealth } from '@/lib/v98store';
import { getConversationStats } from '@/lib/conversation';

export const runtime = 'edge';

// Vibe check messages based on health status
const VIBE_CHECKS = {
  ok: [
    'we\'re thriving fr fr ✨',
    'everything\'s working and the vibes are immaculate',
    'all systems operational, no cap',
    'running smooth like butter 🧈',
  ],
  degraded: [
    'things are kinda wonky but we\'re managing',
    'not perfect but we\'re making it work bestie',
    'the vibes are off but we\'re pushing through',
  ],
  down: [
    'bestie everything is on fire rn 🔥',
    'we are NOT okay, systems are down',
    'the servers said "not today" fr',
  ],
};

function getRandomVibeCheck(status: HealthStatus['status']): string {
  const messages = VIBE_CHECKS[status];
  return messages[Math.floor(Math.random() * messages.length)];
}

export async function GET(request: NextRequest) {
  try {
    // Check v98store API health
    const apiConnected = await checkAPIHealth();

    // Get conversation stats for chaos level
    const stats = getConversationStats();

    // Determine overall health status
    let status: HealthStatus['status'] = 'ok';

    if (!apiConnected) {
      status = 'down';
    }

    const healthStatus: HealthStatus = {
      status,
      vibeCheck: getRandomVibeCheck(status),
      apiConnected,
      timestamp: new Date(),
      chaosLevel: stats.chaosScore,
    };

    // Return appropriate HTTP status code
    const httpStatus = status === 'ok' ? 200 : status === 'degraded' ? 503 : 503;

    return new Response(
      JSON.stringify({
        ...healthStatus,
        stats: {
          totalConversations: stats.totalConversations,
          totalMessages: stats.totalMessages,
          mostUsedVibe: stats.mostUsedVibe,
        },
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      }),
      {
        status: httpStatus,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'down',
        vibeCheck: 'something broke and i\'m not okay 😭',
        apiConnected: false,
        timestamp: new Date(),
        chaosLevel: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
