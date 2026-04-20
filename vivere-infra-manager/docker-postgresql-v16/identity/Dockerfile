# ============================================================
# VIVERE PLATFORM – IDENTITY DATABASE
# PostgreSQL 16 Alpine – Enterprise Optimized
# ============================================================
#
# Este Dockerfile cria uma imagem PostgreSQL para o serviço de identidade.
# Inclui scripts de inicialização (extensões, configurações) e seeds por ambiente.
# As configurações de performance podem ser ajustadas via docker-compose ou linha de comando.
#
# Compatibilidade: Linux, Windows (Docker Desktop), macOS
#
# ============================================================

FROM postgres:16-alpine

LABEL maintainer="Vivere Platform" \
      service="identity-db" \
      version="1.0" \
      description="PostgreSQL database for Identity Service"

# ============================================================
# Configurações de timezone (padrão UTC)
# ============================================================
ENV TZ=UTC \
    PGTZ=UTC

# ============================================================
# Scripts de inicialização e seed
# ============================================================
# Os scripts SQL e shell em /docker-entrypoint-initdb.d/ são executados
# automaticamente na primeira inicialização do container, em ordem alfabética.
COPY init/ /docker-entrypoint-initdb.d/
COPY seeds/ /seeds/

# Garante permissão de execução para scripts shell (ignora se não houver)
RUN chmod +x /docker-entrypoint-initdb.d/*.sh 2>/dev/null || true

# ============================================================
# Volume para persistência de dados
# ============================================================
# O diretório de dados deve ser mapeado via docker-compose para garantir persistência.
VOLUME ["/var/lib/postgresql/data"]

# ============================================================
# Nota: Parâmetros de performance (shared_buffers, work_mem, etc.)
# podem ser passados via comando no docker-compose, por exemplo:
# command: postgres -c shared_buffers=256MB -c work_mem=16MB
# ============================================================