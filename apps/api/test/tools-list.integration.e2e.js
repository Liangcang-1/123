/* eslint-disable no-console */
const assert = require('assert');

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4000';

async function run() {
  const login = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@example.com', password: 'password123' }),
  }).then((r) => r.json());

  const token = login?.data?.accessToken;
  assert.ok(token, 'token missing');

  const tenants = await fetch(`${BASE_URL}/api/me/tenants`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

  const tenantId = tenants?.data?.[0]?.tenantId;
  assert.ok(tenantId, 'tenant missing');

  const tools = await fetch(`${BASE_URL}/api/tools`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Id': tenantId },
  }).then((r) => r.json());

  assert.equal(tools?.ok, true);
  assert.ok(Array.isArray(tools?.data));
  assert.ok(tools.data.length >= 2);
  console.log('✅ tools list integration passed');
}

run().catch((err) => {
  console.error('❌ tools list integration failed', err);
  process.exit(1);
});
