# 电商内容生成平台 MVP（SaaS）

仓库结构：

```text
root/
 ├─ apps/
 │   ├─ api/
 │   └─ web/
 ├─ docker-compose.yml
 ├─ nginx/
 │   └─ conf.d/app.conf
 ├─ .env.example
 ├─ scripts/
 │   └─ deploy.sh
 └─ README.md
```

## API（关键）

- `GET /api/health` -> `{ "status": "ok" }`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/admin/provider-configs`
- `POST /api/admin/provider-configs`
- `POST /api/admin/provider-configs/version`
- `POST /api/admin/provider-configs/rollback`
- `POST /api/admin/secrets`
- `PATCH /api/admin/secrets/rotate`

## Docker 生产部署

### 1) 安装 Docker 与 Docker Compose
在 Linux 服务器安装 Docker Engine + Docker Compose Plugin。

### 2) 准备环境变量

```bash
cp .env.example .env
# 编辑 .env，填写 MASTER_KEY 与 JWT_SECRET
```

> 不要把 OPENAI_API_KEY / RUNNINGHUB_API_KEY 放入 env，这些必须在后台 Secrets Vault 管理。

### 3) 一键上线

```bash
docker compose up -d --build
```

或：

```bash
bash scripts/deploy.sh
```

### 4) 首次初始化（必须）
1. 访问 `http://SERVER_IP/admin/provider-config`
2. 配置 `openai_chat` 与 `runninghub` provider
3. 在 Secrets Vault 填写并轮换 `OPENAI_API_KEY` / `RUNNINGHUB_API_KEY`

### 5) 常用命令

```bash
docker compose logs -f api
docker compose logs -f web
docker compose logs -f nginx
docker compose ps
docker compose down
```

## 迁移机制

`migrate` 服务会在 `postgres` 健康后自动执行 `apps/api/src/database/migrations/*.sql`。

- 首次执行会自动创建 `schema_migrations(version, applied_at)`
- 已执行版本按文件名去重，不会重复执行
- 失败会非 0 退出并阻断后续依赖服务启动

## GitHub 默认显示 `main` 分支

如果你本地开发分支是 `work`，希望 GitHub 仓库默认展示 `main`：

```bash
# 1) 基于当前代码创建/更新 main
git checkout -B main

# 2) 推送到远端 main
git push -u origin main
```

然后在 GitHub 仓库的 **Settings → Branches → Default branch** 中选择 `main`。
