/* eslint-disable no-console */
const assert = require('assert');

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4000';

async function run() {
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@example.com', password: 'password123' }),
  });
  const login = await loginRes.json();
  assert.ok(login?.data?.accessToken, 'login should return token');

  const token = login.data.accessToken;
  const badTenantId = '00000000-0000-0000-0000-000000000000';
  const isolatedRes = await fetch(`${BASE_URL}/api/menu`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Id': badTenantId },
  });

  assert.ok([403, 400].includes(isolatedRes.status), `expected 403/400 got ${isolatedRes.status}`);
  console.log('✅ tenancy isolation e2e passed');
}

run().catch((err) => {
  console.error('❌ tenancy isolation e2e failed', err);
  process.exit(1);
});
