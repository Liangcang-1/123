#!/usr/bin/env bash
set -e

if [ ! -f .env ]; then
  cp .env.example .env
  echo "[deploy] .env created from .env.example"
  echo "[deploy] please edit .env and set MASTER_KEY/JWT_SECRET before production use"
fi

# optional:
# git pull --rebase

docker compose up -d --build
docker compose ps

echo "Deployment finished."
echo "- Web: http://SERVER_IP/"
echo "- API Health: http://SERVER_IP/api/health"
echo "- Admin Provider Config: http://SERVER_IP/admin/provider-config"
