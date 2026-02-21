#!/usr/bin/env bash
set -euo pipefail

echo "[deploy] building images..."
docker compose build

echo "[deploy] starting services..."
docker compose up -d

echo "[deploy] service status"
docker compose ps

echo "[deploy] health checks"
docker compose exec -T api curl -fsS http://localhost:4000/api/health || true
docker compose exec -T web curl -fsS http://localhost:3000/ >/dev/null || true

echo "[deploy] done"
