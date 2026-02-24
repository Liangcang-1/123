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
  assert.ok(login?.data?.accessToken, 'login token missing');

  const token = login.data.accessToken;

  const tenantsRes = await fetch(`${BASE_URL}/api/me/tenants`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const tenants = await tenantsRes.json();
  const tenantId = tenants?.data?.[0]?.tenantId;
  assert.ok(tenantId, 'tenant id missing');

  const execRes = await fetch(`${BASE_URL}/api/ai/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Id': tenantId,
    },
    body: JSON.stringify({ workflowRef: 'demo-workflow', inputs: { name: 'demo' } }),
  });

  const exec = await execRes.json();
  assert.equal(exec?.ok, true, 'execution should return ok');
  assert.equal(exec?.data?.status, 'succeeded');
  assert.ok(exec?.data?.providerJobId);
  console.log('✅ ai execute integration passed');
}

run().catch((err) => {
  console.error('❌ ai execute integration failed', err);
  process.exit(1);
});
