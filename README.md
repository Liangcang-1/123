# ToB 多租户 AI SaaS（PR-002 AI Provider Abstraction）

## 启动
```bash
cp .env.example .env
docker compose up -d --build
```

## 默认种子账号（开发环境）
- Admin: `admin@example.com / password123`
- Merchant Owner: `owner@example.com / password123`
- 默认租户 slug: `demo-tenant`

## PR-002 目标
- 建立统一 AI Provider 抽象接口：`executeWorkflow(...)`
- 所有 AI 调用通过 ProviderRegistry，不允许业务层直连上游
- 新增 `/api/ai/execute`（tenant-scope + permission）用于抽象层联调

## 环境变量
- `JWT_SECRET`
- `MASTER_KEY`
- `E2E_BASE_URL`（可选）
- `AI_DEFAULT_PROVIDER`（建议本地 `mock`）
- `RUNNINGHUB_BASE_URL`
- `RUNNINGHUB_API_KEY`
- `RUNNINGHUB_WEBHOOK_SECRET`

## Provider 说明
- `MockProvider`: 本地/测试使用，立即返回 succeeded
- `ProviderAProvider`(内部实现): 封装 RunningHub 调用，仅 provider 内部允许出现上游专有字段

## 切换本地 mock provider
```bash
export AI_DEFAULT_PROVIDER=mock
```

## Tenancy + AI 执行验证
1) 登录拿 token
```bash
curl -sS http://127.0.0.1/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@example.com","password":"password123"}'
```

2) 查询租户
```bash
curl -sS http://127.0.0.1/api/me/tenants -H "Authorization: Bearer <TOKEN>"
```

3) 调用 AI 抽象接口（需 tenant header）
```bash
curl -sS http://127.0.0.1/api/ai/execute \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H 'Content-Type: application/json' \
  -d '{"workflowRef":"demo-workflow","inputs":{"product":"demo"}}'
```

## 测试
```bash
npm -w apps/api run test:unit:provider
npm -w apps/api run test:e2e:ai
```
