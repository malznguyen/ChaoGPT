/**
 * Test script for ChaoGPT streaming backend
 * Run with: npx tsx scripts/test-streaming.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test health endpoint
async function testHealth() {
  console.log('🔍 Testing health endpoint...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();

    console.log('✅ Health check response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');

    return data.status === 'ok';
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

// Test streaming chat
async function testStreamingChat() {
  console.log('🚀 Testing streaming chat endpoint...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'explain what you are in one sentence',
        vibe: 'chaotic',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Request failed:', error);
      return false;
    }

    console.log('📡 Streaming response:');
    console.log('─'.repeat(50));

    const reader = response.body?.getReader();
    if (!reader) {
      console.error('❌ No response body');
      return false;
    }

    const decoder = new TextDecoder();
    let fullResponse = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('\n' + '─'.repeat(50));
        console.log('✅ Stream completed');
        break;
      }

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            chunkCount++;

            if (data.type === 'content' && data.token) {
              process.stdout.write(data.token);
              fullResponse += data.token;
            } else if (data.type === 'reaction') {
              process.stdout.write(` ${data.reaction} `);
            } else if (data.type === 'end') {
              console.log('\n');
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    console.log(`\n📊 Stats: ${chunkCount} chunks, ${fullResponse.length} characters`);
    console.log('');

    return true;
  } catch (error) {
    console.error('❌ Streaming test failed:', error);
    return false;
  }
}

// Test rate limiting
async function testRateLimit() {
  console.log('⏱️  Testing rate limiting...\n');

  try {
    const requests = Array.from({ length: 5 }, (_, i) =>
      fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': 'test-session-123',
        },
        body: JSON.stringify({
          message: `test message ${i}`,
          vibe: 'chaotic',
        }),
      })
    );

    const responses = await Promise.all(requests);

    console.log('📊 Rate limit test results:');
    responses.forEach((res, i) => {
      const limit = res.headers.get('x-ratelimit-limit');
      const remaining = res.headers.get('x-ratelimit-remaining');
      console.log(`  Request ${i + 1}: ${res.status} (remaining: ${remaining}/${limit})`);
    });

    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Rate limit test failed:', error);
    return false;
  }
}

// Test conversation management
async function testConversations() {
  console.log('💬 Testing conversation management...\n');

  try {
    // Create a conversation
    const createRes = await fetch(`${BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'test conversation',
        vibe: 'chaotic',
      }),
    });

    const createData = await createRes.json();
    console.log('✅ Created conversation:', createData.conversation.id);

    // Get all conversations
    const listRes = await fetch(`${BASE_URL}/api/conversations`);
    const listData = await listRes.json();
    console.log(`✅ Found ${listData.count} conversations`);

    // Get specific conversation
    const getRes = await fetch(
      `${BASE_URL}/api/conversations/${createData.conversation.id}`
    );
    const getData = await getRes.json();
    console.log(`✅ Retrieved conversation: ${getData.title}`);

    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Conversation test failed:', error);
    return false;
  }
}

// Test vibe switching
async function testVibe() {
  console.log('🎭 Testing vibe switching...\n');

  try {
    // Create a conversation first
    const createRes = await fetch(`${BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'test vibe switching',
        vibe: 'chaotic',
      }),
    });

    const { conversation } = await createRes.json();

    // Switch vibe
    const vibeRes = await fetch(`${BASE_URL}/api/vibe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId: conversation.id,
        vibe: 'soft',
      }),
    });

    const vibeData = await vibeRes.json();
    console.log('✅ Vibe switched to:', vibeData.conversation.currentVibe);

    // Analyze vibe
    const analyzeRes = await fetch(
      `${BASE_URL}/api/vibe?conversationId=${conversation.id}`
    );
    const analyzeData = await analyzeRes.json();
    console.log('✅ Vibe analysis:', analyzeData.reasoning);

    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Vibe test failed:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  ChaoGPT Backend Streaming Tests      ║');
  console.log('╚════════════════════════════════════════╝\n');

  const results = {
    health: await testHealth(),
    streaming: await testStreamingChat(),
    rateLimit: await testRateLimit(),
    conversations: await testConversations(),
    vibe: await testVibe(),
  };

  console.log('╔════════════════════════════════════════╗');
  console.log('║  Test Results                          ║');
  console.log('╚════════════════════════════════════════╝\n');

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${test.padEnd(20)} ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const allPassed = Object.values(results).every(r => r);

  console.log('\n' + (allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed'));
  console.log('');

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
