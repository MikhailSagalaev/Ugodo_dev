FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и yarn.lock для установки зависимостей
COPY medusa/package*.json medusa/yarn*.json ./
RUN npm ci

# Копируем исходный код
COPY medusa/ ./

# Собираем приложение
RUN npm run build

# Второй этап для создания финального образа
FROM node:20-alpine

WORKDIR /app

# Копируем собранное приложение из предыдущего этапа
COPY --from=builder /app/.medusa /app/.medusa
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/medusa-config.ts /app/

# Копируем .env файл, но в реальном проекте лучше использовать переменные окружения
COPY medusa/.env /app/.env

# Экспортируем порт 9000
EXPOSE 9000

# Запускаем приложение
CMD ["npm", "run", "start"] 