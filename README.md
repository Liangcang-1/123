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

## 数据库迁移

SQL 文件：`apps/api/src/database/migrations/0001_init.sql`
