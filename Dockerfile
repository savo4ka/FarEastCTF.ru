# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:20.18-alpine AS deps

# Устанавливаем libc6-compat для совместимости
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем только production зависимости (без devDependencies)
RUN npm ci --omit=dev && \
    npm cache clean --force

# ===================================
# Stage 2: Builder
# ===================================
FROM node:20.18-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем все зависимости (включая devDependencies для сборки)
RUN npm ci && \
    npm cache clean --force

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# ===================================
# Stage 3: Runner
# ===================================
FROM node:20.18-alpine AS runner

WORKDIR /app

# Создаём непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Копируем production зависимости из deps stage
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Копируем собранное приложение из builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/.build ./.build
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Создаём директорию для данных (если используется nedb)
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт 3000
EXPOSE 3000

# Устанавливаем переменные окружения
ENV NODE_ENV=production \
    PORT=3000

# Healthcheck для проверки состояния контейнера
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запускаем приложение
CMD ["npm", "start"]
