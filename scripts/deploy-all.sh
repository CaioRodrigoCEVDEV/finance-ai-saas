#!/usr/bin/env bash
#
# deploy-all.sh
# Deploy completo do frontend e backend em producao na VPS.
#
# Uso:
#   chmod +x scripts/deploy-all.sh
#   ./scripts/deploy-all.sh
#
# Ajuste os caminhos abaixo conforme sua VPS.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================"
echo "  Deploy Frontend + Backend"
echo "========================================"

echo ""
echo "--- Deploy Backend ---"
bash "${SCRIPT_DIR}/deploy-backend.sh"

echo ""
echo "--- Deploy Frontend ---"
bash "${SCRIPT_DIR}/deploy-frontend.sh"

echo ""
echo "========================================"
echo "  Deploy concluido com sucesso!"
echo "========================================"
