FROM node:20-alpine AS builder
WORKDIR /app

# Prisma engine на Alpine (musl) требует явно установленный OpenSSL — без него
# движок не стартует ("Could not parse schema engine response")
RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

EXPOSE 4000

# Применяем миграции перед стартом — безопасно для повторного запуска (миграции идемпотентны)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
