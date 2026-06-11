#!/bin/bash
set -e

APP_DIR="/home/sites/finance-ai-saas"
FRONTEND_TARGET="/var/www/finance-ai/frontend"
PM2_APP_NAME="finance-ai-backend"

echo "========================================"
echo "Deploy FinanceAI SaaS - Produção"
echo "========================================"

cd "$APP_DIR"

echo "[1/9] Atualizando código..."
git fetch origin main
git reset --hard origin/main

echo "[2/9] Deploy backend..."
cd "$APP_DIR/backend"
npm install
npx prisma generate
npx prisma migrate deploy

echo "[3/9] Reiniciando backend no PM2..."
pm2 restart "$PM2_APP_NAME" --update-env

echo "[4/9] Deploy frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

echo "[5/9] Publicando frontend no Apache..."
sudo rm -rf "$FRONTEND_TARGET"/*
sudo cp -r dist/* "$FRONTEND_TARGET"/
sudo chown -R www-data:www-data "$FRONTEND_TARGET"

echo "[6/9] Validando Apache..."
sudo apache2ctl configtest

echo "[7/9] Recarregando Apache..."
sudo systemctl reload apache2

echo "[8/9] Salvando estado do PM2..."
pm2 save

echo "[9/9] Status final:"
echo "----------------------------------------"
pm2 status
echo "----------------------------------------"

echo "========================================"
echo "Deploy finalizado com sucesso."
echo "========================================"
