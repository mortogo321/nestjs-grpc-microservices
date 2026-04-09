# ---- Builder stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ARG APP_NAME
RUN npx nest build ${APP_NAME}

# ---- Production stage ----
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY proto/ ./proto/

ARG APP_NAME
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist/apps/${APP_NAME}

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]