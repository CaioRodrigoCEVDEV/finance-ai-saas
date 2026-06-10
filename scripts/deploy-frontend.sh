#!/usr/bin/env bash
#
# deploy-frontend.sh
# Deploy do frontend React em producao na VPS.
#
# Uso:
#   chmod +x scripts/deploy-frontend.sh
#   ./scripts/deploy-frontend.sh
#
# Ajuste os caminhos abaixo conforme sua VPS:
#   - PROJETO_DIR: diretorio onde o repositorio esta clonado
#   - FRONTEND_DIR: diretorio de build servido pelo Apache
#

set -e

PROJETO_DIR="/home/sites/finance-ai-saas"
FRONTEND_DIR="/var/www/finance-ai/frontend"

echo ">>> Entrando no diretorio do projeto: ${PROJETO_DIR}"
cd "${PROJETO_DIR}"

echo ">>> Atualizando codigo (git pull origin main)"
git pull origin main

echo ">>> Entrando no frontend"
cd frontend

echo ">>> Instalando dependencias"
npm install

echo ">>> Buildando frontend"
npm run build

echo ">>> Criando diretorio de producao (se nao existir)"
sudo mkdir -p "${FRONTEND_DIR}"

echo ">>> Removendo build anterior"
sudo rm -rf "${FRONTEND_DIR:?}"/*

echo ">>> Copiando build para diretorio de producao"
sudo cp -r dist/* "${FRONTEND_DIR}/"

echo ">>> Ajustando permissoes"
sudo chown -R www-data:www-data "${FRONTEND_DIR}"

echo ">>> Deploy do frontend concluido com sucesso!"
