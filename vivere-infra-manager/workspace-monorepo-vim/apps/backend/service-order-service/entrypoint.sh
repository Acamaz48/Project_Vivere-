#!/bin/sh
# =====================================================
# VIVERE PLATFORM – SERVICE ORDER SERVICE (ENTRYPOINT REVISADO)
# =====================================================
set -e

echo "=================================================="
echo "🚀 Inicializando: ${SERVICE_NAME:-service-order-service}"
echo "🌎 Ambiente: ${NODE_ENV:-development}"
echo "🗄  Banco: ${DATABASE_HOST:-service-order-db}:${DATABASE_PORT:-5432}"
echo "=================================================="

: "${PORT:=3000}"
: "${DB_WAIT_TIMEOUT:=60}"
: "${DATABASE_HOST:=service-order-db}"
: "${DATABASE_PORT:=5432}"
: "${DATABASE_USER:=postgres}"
: "${DATABASE_PASSWORD:=postgres}"
: "${DATABASE_NAME:=service_order_db}"

if echo "${DATABASE_URL:-}" | grep -q '\${'; then
    echo "ℹ️  Compondo DATABASE_URL..."
    DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?schema=public"
    export DATABASE_URL
fi

if [ -z "${DATABASE_URL}" ]; then
    echo "❌ ERRO: DATABASE_URL não definida."
    exit 1
fi

echo "ℹ️  DATABASE_URL=${DATABASE_URL}"

echo "⏳ Aguardando PostgreSQL (timeout=${DB_WAIT_TIMEOUT}s)..."
START_TIME=$(date +%s)
while ! pg_isready -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -U "${DATABASE_USER}" >/dev/null 2>&1; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    if [ "${ELAPSED}" -ge "${DB_WAIT_TIMEOUT}" ]; then
        echo "❌ Timeout aguardando PostgreSQL."
        exit 1
    fi
    sleep 2
done

echo "🔍 Testando conexão com o banco ${DATABASE_NAME}..."
if ! psql "${DATABASE_URL}" -c "SELECT 1" >/dev/null 2>&1; then
    echo "❌ Não foi possível conectar ao banco ${DATABASE_NAME}."
    exit 1
fi
echo "✅ Banco acessível."

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "📦 Executando migrações Prisma..."
    if [ "${NODE_ENV:-development}" = "production" ]; then
        npx prisma migrate deploy --schema=./prisma/schema.prisma || echo "⚠️  Falha no migrate deploy."
    else
        npx prisma migrate dev --schema=./prisma/schema.prisma --name auto || echo "⚠️  Falha no migrate dev."
    fi
    echo "✅ Migrações concluídas."
else
    echo "⚠️  RUN_MIGRATIONS desabilitado."
fi

if [ "${RUN_POST_SQL:-false}" = "true" ]; then
    POST_SCRIPT="./prisma/service-order_db_post_prisma.sql"
    if [ -f "${POST_SCRIPT}" ]; then
        echo "📜 Executando script SQL complementar..."
        psql "${DATABASE_URL}" -f "${POST_SCRIPT}" || echo "⚠️  Falha no script SQL."
        echo "✅ Script executado."
    else
        echo "ℹ️  Script complementar não encontrado."
    fi
else
    echo "⚠️  RUN_POST_SQL desabilitado."
fi

echo "🔥 Iniciando Service Order Service (node dist/main.js)..."
exec node dist/main.js