# ToB 多租户 AI SaaS（PR-001 Tenancy + RBAC Foundation）

## 启动
```bash
cp .env.example .env
docker compose up -d --build
```

## 默认种子账号（开发环境）
- Admin: `admin@example.com / password123`
- Merchant Owner: `owner@example.com / password123`
- 默认租户 slug: `demo-tenant`

## 关键变化（PR-001）
- 多租户基础表：`tenants / tenant_users / roles / permissions / role_permissions`
- Request 级 Tenant 上下文注入（`X-Tenant-Id`）
- RBAC 权限装饰器/守卫：`@RequirePermissions(...)`
- 新增端点：`GET /api/me/tenants`

## 环境变量
- `JWT_SECRET`: JWT 签名密钥
- `MASTER_KEY`: 平台密钥
- `E2E_BASE_URL`（可选）: e2e 测试 API 地址，默认 `http://127.0.0.1:4000`

## 数据库迁移
compose 的 `migrate` 服务会按 `apps/api/src/database/migrations/*.sql` 自动执行，新增：
- `0005_tenancy_rbac_foundation.sql`

## Tenancy 验证（curl）
1) 登录拿 token
```bash
curl -sS http://127.0.0.1/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@example.com","password":"password123"}'
```

2) 访问租户列表（不要求 `X-Tenant-Id`）
```bash
curl -sS http://127.0.0.1/api/me/tenants -H "Authorization: Bearer <TOKEN>"
```

3) 访问 tenant-scope API（必须带 `X-Tenant-Id`）
```bash
curl -sS http://127.0.0.1/api/menu \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>"
```

## 测试
```bash
npm -w apps/api run test:e2e:tenancy
```

该 e2e 会验证 tenant 隔离：使用错误 tenant header 访问 `/api/menu` 必须 403/400。
