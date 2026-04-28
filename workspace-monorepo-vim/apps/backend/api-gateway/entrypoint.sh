#!/bin/sh
# =====================================================
# VIVERE PLATFORM – API GATEWAY (ENTRYPOINT REVISADO)
# =====================================================
#
# Responsabilidades:
#   1. Validar variáveis obrigatórias
#   2. Aguardar opcionalmente os serviços downstream
#   3. Iniciar a aplicação Node.js
#
# Compatibilidade: POSIX sh (Alpine, bash, dash, Git Bash)
# =====================================================

set -e

echo "=================================================="
echo "🚀 Inicializando: ${SERVICE_NAME:-api-gateway}"
echo "🌎 Ambiente: ${NODE_ENV:-development}"
echo "📡 Porta: ${PORT:-3000}"
echo "=================================================="

# -----------------------------------------------------
# 1. Validações
# -----------------------------------------------------
: "${PORT:=3000}"
export PORT

# -----------------------------------------------------
# 2. (Opcional) Aguarda serviços downstream
# -----------------------------------------------------
if [ "${WAIT_FOR_SERVICES:-false}" = "true" ]; then
    echo "⏳ WAIT_FOR_SERVICES ativado. Aguardando serviços..."
    SERVICES_WAIT_TIMEOUT="${SERVICES_WAIT_TIMEOUT:-60}"
    START_TIME=$(date +%s)

    SERVICE_URLS="
        ${IDENTITY_SERVICE_URL:-http://identity-service:3000}/health
        ${AUTH_SERVICE_URL:-http://auth-service:3000}/health
        ${WAREHOUSE_SERVICE_URL:-http://warehouse-service:3000}/health
        ${SERVICE_ORDER_SERVICE_URL:-http://service-order-service:3000}/health
        ${LOGISTICS_SERVICE_URL:-http://logistics-service:3000}/health
    "

    for url in $SERVICE_URLS; do
        echo "🔎 Verificando: $url"
        while true; do
            if wget --spider -q "$url" 2>/dev/null || curl -fI "$url" 2>/dev/null >/dev/null; then
                echo "✅ $url está acessível."
                break
            fi

            CURRENT_TIME=$(date +%s)
            ELAPSED=$((CURRENT_TIME - START_TIME))
            if [ "$ELAPSED" -ge "$SERVICES_WAIT_TIMEOUT" ]; then
                echo "❌ Tempo limite excedido ao aguardar $url. Abortando."
                exit 1
            fi

            sleep 2
        done
    done

    echo "✅ Todos os serviços downstream estão acessíveis."
fi

# -----------------------------------------------------
# 3. Inicia a aplicação
# -----------------------------------------------------
echo "🔥 Iniciando API Gateway (node dist/main.js)..."
exec node dist/main.js