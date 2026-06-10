#!/usr/bin/env bash
#
# deploy-backend.sh
# Deploy do backend Node.js em producao na VPS.
#
# Uso:
#   chmod +x scripts/deploy-backend.sh
#   ./scripts/deploy-backend.sh
#
# Ajuste os caminhos abaixo conforme sua VPS:
#   - PROJETO_DIR: diretorio onde o repositorio esta clonado
#

set -e

PROJETO_DIR="/home/sites/finance-ai-saas"

echo ">>> Entrando no diretorio do projeto: ${PROJETO_DIR}"
cd "${PROJETO_DIR}"

echo ">>> Atualizando codigo (git pull origin main)"
git pull origin main

echo ">>> Entrando no backend"
cd backend

echo ">>> Instalando dependencias de producao"
npm install --omit=dev

echo ">>> Gerando Prisma Client"
npx prisma generate

echo ">>> Executando migrations pendentes"
npx prisma migrate deploy

echo ">>> Reiniciando backend no PM2"
pm2 restart finance-ai-backend || pm2 start ../ecosystem.config.js --env production

echo ">>> Salvando configuracao do PM2"
pm2 save

echo ">>> Deploy do backend concluido com sucesso!"
