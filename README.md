# 电商商家 AI 创作与运营工具平台（SaaS MVP）

## 架构
- Monorepo: `apps/api` (NestJS + TypeORM + PostgreSQL) / `apps/web` (Next.js 14)
- 部署: Docker Compose (`postgres` / `redis` / `migrate` / `api` / `web` / `nginx`)

## 核心能力
- 多租户（Tenant）+ 角色（OWNER/ADMIN/MEMBER）
- 平台后台可配置 Provider、同步 Catalog、编排商家端菜单、租户授权
- 商家端动态菜单 -> 创作提交 -> 任务状态 -> 素材入库闭环

## 关键 API
- Auth: `POST /api/auth/login`, `GET /api/me`
- Menu/Catalog: `GET /api/menu`, `GET /api/catalog/templates`, `GET /api/catalog/tools`
- Tasks: `POST /api/tasks/run`, `GET /api/tasks`, `GET /api/tasks/:id`, `POST /api/tasks/:id/retry`, `POST /api/tasks/:id/cancel`
- Assets: `GET /api/assets`, `GET /api/assets/:id`
- Settings: `GET/PUT /api/settings`
- Admin: `GET/POST /api/admin/provider-configs`, `POST /api/admin/catalog/sync`, `GET/POST /api/admin/menu/groups`, `GET/POST /api/admin/menu/items`, `GET/POST /api/admin/tenants/:id/entitlements`, `GET /api/admin/audit-logs`

## Docker 生产部署（增量，不清空）
```bash
cp .env.example .env
# 填写 MASTER_KEY / JWT_SECRET

docker compose up -d --build
```

### 一键脚本
```bash
bash scripts/deploy.sh
```

脚本会：
1. 校验 `.env`（不存在则从 `.env.example` 复制）
2. 执行 `docker compose up -d --build`
3. 输出服务状态

## 首次初始化
- 默认演示账号（seed）
  - 邮箱：`owner@example.com`
  - 密码：`password123`
- 登录后可看到默认菜单、模板、工具、任务与素材入口。

## 运维排查
```bash
docker compose ps
docker compose logs -f api
docker compose logs -f web
docker compose logs -f nginx
```

### 端口冲突（宿主机 Nginx 占用 80）
```bash
sudo systemctl stop nginx
# 或修改 docker-compose.yml 的 nginx 映射端口，如 "8080:80"
```

## Healthcheck
- API: `GET /api/health` -> `{"status":"ok"}`
- Web: `/` 返回 200
- Nginx: `/` 与 `/api/health` 均可访问

## 验收 Checklist
- [ ] `docker compose ps` 全部 healthy
- [ ] 访问 `http://<server-ip>/` 可见登录页/工作台
- [ ] Admin 修改菜单后商家端左侧菜单即时变化
- [ ] 商家端能创建任务并在任务中心查看状态
- [ ] 任务成功后素材库可看到新资产记录
- [ ] 商家端页面与接口无 Provider 实现品牌暴露
