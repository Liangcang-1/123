# 电商商家 AI 创作与运营工具平台（SaaS V1）

## 项目结构
- `apps/api`: NestJS + TypeORM + PostgreSQL
- `apps/web`: Next.js 14 App Router
- `docker-compose.yml`: postgres/redis/migrate/api/web/nginx 一体化部署

## 默认账号（空库首次启动自动 seed）
- 平台管理员：`admin@example.com / password123`
- 商家账号：`owner@example.com / password123`

## 一键部署（增量，不清库）
```bash
cp .env.example .env
# 填写 MASTER_KEY / JWT_SECRET

docker compose up -d --build
```

## 验收命令
```bash
curl -sS http://127.0.0.1/api/health
curl -sS http://127.0.0.1/api/menu
curl -sS http://127.0.0.1/api/billing/summary
```

## 功能闭环
1. 登录商家账号进入 `/dashboard`
2. 左侧菜单选择模板/工具，进入 `/tools/:menuItemId`
3. 提交生成任务，结果自动写入任务中心 `/tasks` 与素材库 `/assets`
4. 未开通工具灰态可见，点击可查看升级引导

## 关键 API
- `GET /api/menu`（含 version、分组、灰态工具信息）
- `GET /api/tools/:menuItemId/meta`
- `POST /api/tasks/run`
- `GET /api/tasks`
- `GET /api/assets`, `POST /api/assets/folders`, `PATCH /api/assets/:id`, `DELETE /api/assets/:id`
- `GET /api/billing/summary`, `GET /api/billing/by-tool`

## 运维排查
```bash
docker compose ps
docker compose logs -f api
docker compose logs -f web
docker compose logs -f nginx
```

## 端口冲突
宿主机占用 80 时：
```bash
sudo systemctl stop nginx
# 或将 docker-compose nginx 端口改为 8080:80
```
