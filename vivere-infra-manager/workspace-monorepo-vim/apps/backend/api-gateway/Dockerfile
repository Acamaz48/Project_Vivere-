# ============================================================
# DOCKERFILE – API GATEWAY (VIVERE PLATFORM)
# Versão: Enterprise | Multi‑stage | Cross‑platform | Hardened
# ============================================================

FROM node:20-alpine AS builder

RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json eslint.config.mjs jest.config.ts jest.preset.js ./

RUN npm ci

COPY apps/backend/api-gateway ./apps/backend/api-gateway
COPY libs ./libs

RUN npx nx build api-gateway

FROM node:20-alpine

RUN apk add --no-cache curl wget && rm -rf /var/cache/apk/*

RUN addgroup -S app && adduser -S -G app app

WORKDIR /app

COPY --from=builder --chown=app:app /app/package.json ./
COPY --from=builder --chown=app:app /app/package-lock.json ./

RUN npm ci --omit=dev --no-audit --no-fund

COPY --from=builder --chown=app:app /app/dist/apps/backend/api-gateway ./dist

COPY --chown=app:app apps/backend/api-gateway/entrypoint.sh /entrypoint.sh
RUN chmod 0755 /entrypoint.sh

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD sh -c 'curl -f http://localhost:${PORT:-3000}/health 2>/dev/null || wget --spider http://localhost:${PORT:-3000}/health 2>/dev/null || exit 1'

ENTRYPOINT ["/entrypoint.sh"]