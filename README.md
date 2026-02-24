# ToB 多租户 AI SaaS（PR-003 Tool Marketplace + Menu）

## 启动
```bash
cp .env.example .env
docker compose up -d --build
```

## 默认种子账号（开发环境）
- Admin: `admin@example.com / password123`
- Merchant Owner: `owner@example.com / password123`
- 默认租户 slug: `demo-tenant`

## 本次 PR-003 变更
- 新增 Tool Marketplace（system tools + tenant private tools）
- 新增租户菜单配置（`tool_menu_items`），支持启用/禁用与排序
- 新增基于 `input_schema` 的最小动态表单，支持直接执行工具链路（通过 AI provider 抽象层）

## 环境变量
- `JWT_SECRET`
- `MASTER_KEY`
- `E2E_BASE_URL`（可选）
- `AI_DEFAULT_PROVIDER`（本地建议 `mock`）
- `RUNNINGHUB_BASE_URL`
- `RUNNINGHUB_API_KEY`
- `RUNNINGHUB_WEBHOOK_SECRET`

## 数据迁移与 Seed
```bash
# 服务启动后会按现有流程执行 migration + seed（首次空库）
# 新增 migration:
# apps/api/src/database/migrations/0006_tool_marketplace_menu.sql
```

## 工具市场与菜单 API 验证
1) 登录获取 token
```bash
curl -sS http://127.0.0.1/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"owner@example.com","password":"password123"}'
```

2) 获取 tenantId
```bash
curl -sS http://127.0.0.1/api/me/tenants \
  -H "Authorization: Bearer <TOKEN>"
```

3) 查看工具列表
```bash
curl -sS http://127.0.0.1/api/tools \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>"
```

4) 查看/初始化菜单
```bash
curl -sS http://127.0.0.1/api/tool-menu \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>"
```

5) 执行工具（同步验证链路）
```bash
curl -sS http://127.0.0.1/api/tools/<TOOL_ID>/execute \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H 'Content-Type: application/json' \
  -d '{"inputs":{"prompt":"夏季上新主图","size":"1024x1024"}}'
```

## Web 页面
- `/tools`：工具列表 + 新建工具
- `/menu`：租户菜单配置（启用/禁用、排序）
- `/run/:toolKey`：按 `input_schema` 动态渲染并执行

## input_schema 最小规范
```json
{
  "title": "Product Image Generator",
  "fields": [
    { "key": "prompt", "label": "Prompt", "type": "textarea", "required": true },
    { "key": "image", "label": "Base Image", "type": "asset_ref", "required": false },
    { "key": "size", "label": "Size", "type": "select", "options": ["1024x1024", "1024x1536"] },
    { "key": "count", "label": "Count", "type": "number" },
    { "key": "needTitle", "label": "Need Title", "type": "boolean" }
  ]
}
```
支持类型：`text` / `textarea` / `number` / `select` / `boolean` / `asset_ref`。

## 测试
```bash
npm -w apps/api run test:e2e:tools-list
npm -w apps/api run test:e2e:tool-menu-scope
npm -w apps/api run test:unit:provider
```
