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

  const tenants = await fetch(`${BASE_URL}/api/me/tenants`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
  const tenantId = tenants?.data?.[0]?.tenantId;

  const badToolId = '00000000-0000-0000-0000-000000000000';
  const res = await fetch(`${BASE_URL}/api/tool-menu`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Id': tenantId,
    },
    body: JSON.stringify({ items: [{ toolId: badToolId, enabled: true, sortOrder: 0 }] }),
  });

  assert.ok([400, 403].includes(res.status), `expected 400/403, got ${res.status}`);
  console.log('✅ tool-menu scope integration passed');
}

run().catch((err) => {
  console.error('❌ tool-menu scope integration failed', err);
  process.exit(1);
});
