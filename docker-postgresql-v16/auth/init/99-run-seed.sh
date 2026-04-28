#!/bin/bash
# =====================================================
# VIVERE PLATFORM – AUTH DATABASE
# Script de seed (executado após a inicialização do banco)
# =====================================================
#
# Este script é executado automaticamente pelo PostgreSQL
# ao final do processo de inicialização (último da ordem).
# Ele verifica a variável de ambiente SEED_ENV e, se existir
# um arquivo de seed correspondente em /seeds/, o executa.
#
# Compatibilidade: Linux, Windows (Git Bash), macOS
# =====================================================

set -e  # Interrompe o script em caso de erro

if [ -n "$SEED_ENV" ] && [ -f "/seeds/$SEED_ENV.sql" ]; then
    echo ">>> [AUTH] Executando seed para ambiente: $SEED_ENV"
    psql -v ON_ERROR_STOP=1 \
         --username "$POSTGRES_USER" \
         --dbname "$POSTGRES_DB" \
         -f "/seeds/$SEED_ENV.sql"
    echo ">>> [AUTH] Seed concluído com sucesso."
else
    echo ">>> [AUTH] Nenhum seed encontrado para o ambiente '$SEED_ENV' ou variável não definida."
fi