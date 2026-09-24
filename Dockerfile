# Multi-stage production Dockerfile (one image per app via the APP_NAME build arg).
#
#   docker compose up --build
#
# Bun is the package manager (bun.lock is the single source of truth); Node 22
# is the runtime. The bun binary is copied in from the official image because
# oven/bun images don't ship node, and the Nest CLI bins need it.

# ---- Builder stage ----
FROM oven/bun:1-alpine AS bun
FROM node:22-alpine AS builder

# Both binaries: oven/bun images don't ship node, and the Nest CLI bins need it
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bunx /usr/local/bin/

WORKDIR /app

ARG APP_NAME

# Install all dependencies (including devDependencies for the build)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bunx nest build ${APP_NAME}

# ---- Production stage ----
FROM node:22-alpine AS production

# Bun is needed again for the production-only install below
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bunx /usr/local/bin/

WORKDIR /app

ENV NODE_ENV=production

ARG APP_NAME
# Persist the build arg as a runtime env var: the CMD below expands ${APP_NAME}
# in the container's shell, where build-time ARGs are otherwise invisible.
ENV APP_NAME=${APP_NAME}

# Production-only dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY proto/ ./proto/
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist/apps/${APP_NAME}
COPY --from=builder /app/dist/src ./dist/src

# Run as a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/src/main.js"]
