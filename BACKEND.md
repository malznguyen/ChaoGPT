# ChaoGPT Backend Documentation

Complete streaming backend implementation for ChaoGPT with Gen Z personality and GPT-4o integration.

## Architecture Overview

The backend is built on Next.js 14 App Router with Edge runtime for optimal streaming performance. It integrates with the v98store.com API to access GPT-4o and layers personality on top.

### Core Components

```
lib/
├── types.ts              # TypeScript type definitions
├── personality.ts        # Personality injection system
├── v98store.ts          # v98store.com API integration
├── conversation.ts      # Conversation management
├── streaming.ts         # Streaming response handler
├── rate-limit.ts        # Rate limiting & spam detection
└── errors.ts            # Error handling with personality

app/api/
├── chat/route.ts                    # Main streaming chat endpoint
├── conversations/route.ts           # CRUD for conversations
├── conversations/[id]/route.ts      # Individual conversation ops
├── vibe/route.ts                    # Vibe analysis & switching
└── health/route.ts                  # Health check endpoint

hooks/
└── useChat.ts           # Client-side React hook for SSE
```

## API Endpoints

### 🚀 POST /api/chat

Main streaming chat endpoint with Server-Sent Events (SSE).

**Request:**
```json
{
  "message": "help me with react hooks",
  "conversationId": "optional-conversation-id",
  "vibe": "chaotic"
}
```

**Response:** SSE stream with chunks:
```
data: {"type": "thinking", "token": "..."}\n\n
data: {"type": "content", "token": "bestie"}\n\n
data: {"type": "reaction", "reaction": "👁️👄👁️"}\n\n
data: {"type": "content", "token": " okay so"}\n\n
data: {"type": "end", "status": "complete"}\n\n
```

**Headers:**
- `Content-Type: text/event-stream`
- `X-Conversation-Id: <id>`
- `X-Vibe: <current-vibe>`
- `X-RateLimit-Limit: 60`
- `X-RateLimit-Remaining: 59`

### 📚 GET /api/conversations

Get all conversations or search.

**Query Parameters:**
- `q`: Search query (optional)
- `stats`: Include stats (optional, `true`/`false`)

**Response:**
```json
{
  "conversations": [...],
  "count": 5,
  "stats": {
    "totalConversations": 5,
    "totalMessages": 42,
    "mostUsedVibe": "chaotic",
    "chaosScore": 75
  }
}
```

### 📝 POST /api/conversations

Create a new conversation.

**Request:**
```json
{
  "message": "what should i learn next?",
  "vibe": "study"
}
```

### 🔍 GET /api/conversations/[id]

Get a specific conversation.

**Query Parameters:**
- `format`: Export format (`json`)
- `messagesOnly`: Return only messages (`true`/`false`)

### 🎭 GET /api/vibe

Analyze vibe for a conversation.

**Query Parameters:**
- `conversationId`: Conversation ID (required)

**Response:**
```json
{
  "currentVibe": "chaotic",
  "vibeScore": 75,
  "suggestedVibe": "unhinged",
  "reasoning": "the chaos levels are off the charts",
  "chaosLevel": 85
}
```

### 🎭 POST /api/vibe

Update vibe for a conversation.

**Request:**
```json
{
  "conversationId": "...",
  "vibe": "soft"
}
```

### 💚 GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "vibeCheck": "we're thriving fr fr ✨",
  "apiConnected": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "chaosLevel": 75,
  "stats": {
    "totalConversations": 5,
    "totalMessages": 42,
    "mostUsedVibe": "chaotic"
  },
  "version": "1.0.0",
  "environment": "development"
}
```

## Vibe Modes

ChaoGPT supports 4 distinct vibe modes:

### 🎭 Chaotic (default)
Unhinged Gen Z energy with internet slang, memes, and pop culture references.

**Personality traits:**
- Uses lowercase except for EMPHASIS
- Drops "bestie", "fr fr", "no cap", "it's giving"
- References TikTok trends and Twitter discourse
- Helpful but chaotic

### 🥺 Soft
Gentle, supportive 3am deep convo energy.

**Personality traits:**
- Still Gen Z but softer
- More comfort, less chaos
- Supportive friend energy
- Genuine but gentle

### 🌪️ Unhinged
MAXIMUM CHAOS. 7 energy drinks vibes.

**Personality traits:**
- ALL CAPS OCCASIONALLY
- Keysmashing (AKSJDHFKJSDHF)
- Racing thoughts
- Barely holding it together but helpful

### 📚 Study
Study buddy with ADHD trying to focus.

**Personality traits:**
- Trying SO HARD to stay on topic
- Gets distracted but snaps back
- Academic struggle humor
- Makes learning fun

## Rate Limiting

- **Limit:** 60 requests per minute per session
- **Window:** Rolling 1-minute window
- **Tracking:** Session-based (via headers or IP)
- **Response:** HTTP 429 with personality message

**Headers:**
- `X-RateLimit-Limit`: Max requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Spam Detection

The backend includes spam detection:

- Repeated characters (10+)
- Excessive all caps (100+ chars)
- Excessive punctuation (5+ repeated)
- Very short messages (<3 chars)

**Chaos Score:**
- Normal behavior: -1 point
- Spam detected: +10 points
- Abuse detected: +25 points
- Score > 50 or violations > 5: Blocked

## Streaming Implementation

### Server-Side (SSE)

```typescript
// chunks are sent in SSE format:
data: {"type": "content", "token": "hello"}\n\n
data: {"type": "reaction", "reaction": "✨"}\n\n
data: {"type": "end", "status": "complete"}\n\n
```

**Chunk Types:**
- `thinking`: Initial delay indicator
- `content`: Text token
- `reaction`: Emoji reaction
- `emotion`: Emotional tone
- `end`: Stream complete
- `error`: Error occurred

### Client-Side (useChat hook)

```tsx
import { useChat } from '@/hooks/useChat';

function ChatComponent() {
  const { messages, sendMessage, isStreaming, currentVibe, setVibe } = useChat({
    vibe: 'chaotic',
    onError: (error) => console.error(error),
    onComplete: (message) => console.log('Complete:', message),
  });

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => sendMessage('hey bestie')}>
        Send
      </button>
    </div>
  );
}
```

## Error Handling

All errors maintain personality:

```typescript
{
  "error": {
    "code": "rate_limit",
    "message": "bestie you're doing too much rn, take a breath 😭",
    "technical": "Rate limit exceeded: 60 requests per minute"
  }
}
```

**Error Codes:**
- `rate_limit`: Rate limit exceeded
- `api_error`: v98store API error
- `invalid_request`: Bad request
- `timeout`: Request timeout
- `context_overflow`: Too many messages
- `authentication`: Auth failed
- `spam_detected`: Spam detected
- `unknown`: Unknown error

## Personality Features

### Response Starters
Different starters based on vibe:
- Chaotic: "bestie what-", "oh we're doing this?"
- Soft: "okay so,", "hey bestie,"
- Unhinged: "AKSJDHFKJSDHF OKAY-", "WAIT WAIT WAIT-"
- Study: "okay focus time-", "alright brain let's do this-"

### Response Enders
Personality-driven endings:
- Chaotic: "anyway stream taylor swift", "no cap that's it"
- Soft: "you got this 💗", "hope that helps!"
- Unhinged: "ANYWAY-", "ok i need to calm down"
- Study: "now back to procrastinating", "academic weapon status"

### Special Features

**Beef Mode:**
Mentions of competitors (ChatGPT, GPT-4, OpenAI) trigger competitive responses:
- "chatgpt could never have this personality fr fr"
- "they're fine i guess but like... do they have THIS energy? no."

**Touch Grass Reminder:**
After 50 messages or 2 hours:
- "bestie you've been here a while, maybe touch some grass?"
- "not me suggesting you log off but like... when was the last time you went outside?"

## Environment Variables

Required:
```bash
V98STORE_API_KEY=your_key_here
```

Optional:
```bash
V98STORE_API_URL=https://v98store.com
RATE_LIMIT_ENABLED=true
CHAOS_LEVEL=100
ENABLE_TELEMETRY=true
```

## Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Send Message
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "explain react hooks", "vibe": "chaotic"}'
```

### Get Conversations
```bash
curl http://localhost:3000/api/conversations
```

### Change Vibe
```bash
curl -X POST http://localhost:3000/api/vibe \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "...", "vibe": "soft"}'
```

## Performance Optimizations

- **Edge Runtime:** All routes use edge runtime for minimal latency
- **Streaming:** True streaming with backpressure handling
- **Rate Limiting:** Efficient in-memory rate limiting
- **Cleanup:** Automatic cleanup of old conversations and rate limits
- **Message Limit:** Auto-trim to last 50 messages per conversation

## Security

- Request validation with proper error messages
- Rate limiting per session
- Spam detection and blocking
- Input sanitization
- CORS headers (configure as needed)
- No sensitive data in logs

## Deployment Notes

1. Set `V98STORE_API_KEY` in production environment
2. Enable `RATE_LIMIT_ENABLED=true` in production
3. Configure CORS for your domain
4. Set up monitoring for `/api/health`
5. Consider adding Redis for distributed rate limiting
6. Add database for persistent conversation storage

## Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your V98STORE_API_KEY

# Run development server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health
```

## Next Steps

1. Add Redis/Upstash for distributed storage
2. Implement conversation persistence (database)
3. Add user authentication
4. Implement conversation sharing
5. Add analytics/telemetry
6. Create admin dashboard
7. Add WebSocket support for real-time features
8. Implement conversation export formats (PDF, TXT)

---

**Remember:** The backend should feel chaotic but be rock-solid underneath. It's organized chaos - everything works flawlessly while feeling completely unhinged. No cap fr fr ✨
