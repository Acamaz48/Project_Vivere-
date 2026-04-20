#!/bin/sh
# =====================================================
# VIVERE PLATFORM – AUTH SERVICE (ENTRYPOINT REVISADO)
# =====================================================
#
# Responsabilidades:
#   1. Validar variáveis obrigatórias
#   2. Aguardar PostgreSQL (com timeout e teste real de conexão)
#   3. Executar migrações Prisma (opcional)
#   4. Executar script SQL complementar (opcional)
#   5. Iniciar a aplicação Node.js
#
# Compatibilidade: POSIX sh
# =====================================================

set -e

echo "=================================================="
echo "🚀 Inicializando: ${SERVICE_NAME:-auth-service}"
echo "🌎 Ambiente: ${NODE_ENV:-development}"
echo "🗄  Banco: ${DATABASE_HOST:-auth-db}:${DATABASE_PORT:-5432}"
echo "=================================================="

# -----------------------------------------------------
# 1. Validações e composição da DATABASE_URL
# -----------------------------------------------------
: "${PORT:=3000}"
: "${DB_WAIT_TIMEOUT:=60}"
: "${DATABASE_HOST:=auth-db}"
: "${DATABASE_PORT:=5432}"
: "${DATABASE_USER:=postgres}"
: "${DATABASE_PASSWORD:=postgres}"
: "${DATABASE_NAME:=auth_db}"

if echo "${DATABASE_URL:-}" | grep -q '\${'; then
    echo "ℹ️  Compondo DATABASE_URL a partir de variáveis explícitas..."
    DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?schema=public"
    export DATABASE_URL
fi

if [ -z "${DATABASE_URL}" ]; then
    echo "❌ ERRO: DATABASE_URL não foi definida e não pôde ser composta."
    exit 1
fi

echo "ℹ️  DATABASE_URL=${DATABASE_URL}"

# -----------------------------------------------------
# 2. Aguardar PostgreSQL (com timeout e teste real)
# -----------------------------------------------------
echo "⏳ Aguardando PostgreSQL ficar pronto (timeout=${DB_WAIT_TIMEOUT}s)..."
START_TIME=$(date +%s)
while ! pg_isready -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -U "${DATABASE_USER}" >/dev/null 2>&1; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    if [ "${ELAPSED}" -ge "${DB_WAIT_TIMEOUT}" ]; then
        echo "❌ Timeout aguardando PostgreSQL em ${DATABASE_HOST}:${DATABASE_PORT}."
        exit 1
    fi
    sleep 2
done

echo "🔍 Testando conexão com o banco ${DATABASE_NAME}..."
if ! psql "${DATABASE_URL}" -c "SELECT 1" >/dev/null 2>&1; then
    echo "❌ Não foi possível conectar ao banco ${DATABASE_NAME}."
    exit 1
fi
echo "✅ Banco ${DATABASE_NAME} acessível."

# -----------------------------------------------------
# 3. Executar migrações Prisma (se habilitado)
# -----------------------------------------------------
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "📦 Executando migrações Prisma..."
    if [ "${NODE_ENV:-development}" = "production" ]; then
        npx prisma migrate deploy --schema=./prisma/schema.prisma || {
            echo "⚠️  Falha no 'prisma migrate deploy' (não fatal)."
        }
    else
        npx prisma migrate dev --schema=./prisma/schema.prisma --name auto || {
            echo "⚠️  Falha no 'prisma migrate dev' (pode não haver mudanças)."
        }
    fi
    echo "✅ Migrações concluídas (ou ignoradas com falha controlada)."
else
    echo "⚠️  RUN_MIGRATIONS está desabilitado."
fi

# -----------------------------------------------------
# 4. Executar script SQL complementar (se habilitado)
# -----------------------------------------------------
if [ "${RUN_POST_SQL:-false}" = "true" ]; then
    POST_SCRIPT="./prisma/auth_db_post_prisma.sql"
    if [ -f "${POST_SCRIPT}" ]; then
        echo "📜 Executando script SQL complementar: ${POST_SCRIPT}"
        psql "${DATABASE_URL}" -f "${POST_SCRIPT}" || {
            echo "⚠️  Falha na execução do script SQL (não fatal)."
        }
        echo "✅ Script complementar executado."
    else
        echo "ℹ️  Script complementar não encontrado: ${POST_SCRIPT}"
    fi
else
    echo "⚠️  RUN_POST_SQL está desabilitado."
fi

# -----------------------------------------------------
# 5. Iniciar a aplicação
# -----------------------------------------------------
echo "🔥 Iniciando Auth Service (node dist/main.js)..."
exec node dist/main.js