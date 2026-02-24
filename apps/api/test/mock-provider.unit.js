/* eslint-disable no-console */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function run() {
  const file = path.join(__dirname, '../src/modules/ai-providers/providers/mock.provider.ts');
  const source = fs.readFileSync(file, 'utf8');

  assert.ok(source.includes("providerKey()"), 'mock provider should expose providerKey');
  assert.ok(source.includes("return 'mock'"), 'mock provider key should be mock');
  assert.ok(source.includes('executeWorkflow(params'), 'mock provider should implement executeWorkflow');
  assert.ok(source.includes("status: 'succeeded'"), 'mock provider should return succeeded status');

  console.log('✅ mock provider unit passed');
}

run().catch((err) => {
  console.error('❌ mock provider unit failed', err);
  process.exit(1);
});
