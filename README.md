# 电商内容生成平台 MVP（SaaS）

Monorepo:
- `apps/api`: NestJS + PostgreSQL + Redis 队列（RunningHub任务封装）
- `apps/web`: Next.js + Tailwind + Zustand + TanStack Query

## 快速启动

```bash
npm install
npm run dev -w api
npm run dev -w web
```

## 后端 API（MVP）

- `POST /api/auth/login`
- `GET /api/me`
- `POST /api/projects`
- `GET /api/projects`
- `POST /api/tools/chat/run`
- `GET /api/workflows`
- `POST /api/generate/run`
- `GET /api/tasks`
- `GET /api/assets`
- `POST /api/batch/upload`
- `POST /api/batch/run`
- `GET /api/usage`

Admin Config:
- `GET /api/admin/provider-configs`
- `POST /api/admin/provider-configs`
- `POST /api/admin/provider-configs/version`
- `POST /api/admin/provider-configs/rollback`
- `POST /api/admin/secrets`
- `PATCH /api/admin/secrets/rotate`

## 数据库迁移

- `apps/api/src/database/migrations/0001_init.sql`
- `apps/api/src/database/migrations/0002_provider_config.sql`

## 关键环境变量

- `MASTER_KEY`: AES-256 密钥派生源（用于 secrets_vault 加密）
- `REDIS_URL`: 用于 config_updated pub/sub 与任务队列
