const http = require('http');

const API_URL = 'http://localhost:3000';

function test(name, fn) {
  console.log(`\n🧪 ${name}`);
  return fn()
    .then(() => console.log(`   ✓ Passed`))
    .catch(err => console.error(`   ✗ Failed: ${err.message}`));
}

async function runTests() {
  console.log('🚀 Running API tests...\n');

  await test('Health check', async () => {
    const res = await fetch(`${API_URL}/api/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Health check failed');
  });

  await test('Validate passphrase endpoint', async () => {
    const res = await fetch(`${API_URL}/api/validate-passphrase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase: 'test passphrase words' })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error('Passphrase validation failed');
  });

  await test('Contact form endpoint', async () => {
    const res = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        topic: 'Test',
        message: 'Test message'
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error('Contact submission failed');
  });

  console.log('\n✅ All tests passed!\n');
}

runTests().catch(err => {
  console.error('\n❌ Tests failed:', err.message);
  process.exit(1);
});
