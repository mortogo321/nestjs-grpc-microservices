# --- Builder stage ---
FROM node:22-alpine AS builder

ARG APP_NAME

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

COPY tsconfig.json nest-cli.json ./
COPY proto/ ./proto/
COPY apps/ ./apps/

RUN npx nest build ${APP_NAME}

# --- Production stage ---
FROM node:22-alpine AS production

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY proto/ ./proto/
COPY --from=builder /app/dist ./dist

USER node

CMD node dist/apps/${APP_NAME}/main.js
