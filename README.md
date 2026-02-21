# 电商内容生成平台 MVP（SaaS）

Monorepo:
- `apps/api`: NestJS + PostgreSQL + Redis 队列（RunningHub任务封装）
- `apps/web`: Next.js + Tailwind + Zustand + TanStack Query

## 本地开发

```bash
npm install
npm run dev -w api
npm run dev -w web
```

## 后端 API（MVP）

- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/health`（健康检查）
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

## Docker Compose 生产部署（纯 Docker）

### 1) 前置条件
- Linux 服务器已安装 Docker + Docker Compose Plugin
- 放行 80 端口

### 2) 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，至少设置 JWT_SECRET 与 MASTER_KEY
```

> 注意：`OPENAI_API_KEY` / `RUNNINGHUB_API_KEY` **不要放入 env**，必须通过后台 `Secrets Vault` 管理。

### 3) 一键启动

```bash
docker compose up -d --build
```

或使用脚本：

```bash
bash scripts/deploy.sh
```

### 4) 首次初始化（必须）
1. 打开 `http://<server-ip>/admin/provider-config`
2. 配置 `openai_chat` 与 `runninghub` 的 provider JSON 并保存版本
3. 在 `Secrets Vault` 中写入并轮换 `OPENAI_API_KEY` / `RUNNINGHUB_API_KEY`

### 5) 迁移机制
- `migrate` 服务会在启动时自动执行 `apps/api/src/database/migrations/*.sql`
- 使用 `schema_migrations(version, applied_at)` 跟踪已执行迁移，避免重复执行

### 6) 常见故障排查

```bash
docker compose ps
docker compose logs -f migrate
docker compose logs -f api
docker compose logs -f web
docker compose logs -f nginx
```

迁移失败处理：
1. 查看 `migrate` 日志定位失败 SQL
2. 修复 SQL 或数据库状态后重新执行：
   ```bash
   docker compose up -d migrate
   ```
3. 成功后再拉起全量服务：
   ```bash
   docker compose up -d
   ```

## 数据库迁移

- `apps/api/src/database/migrations/0001_init.sql`
- `apps/api/src/database/migrations/0002_provider_config.sql`

## 关键环境变量

- `MASTER_KEY`: AES-256 密钥派生源（用于 `secrets_vault` 加密）
- `REDIS_URL`: 用于 `config_updated` pub/sub 与任务队列
