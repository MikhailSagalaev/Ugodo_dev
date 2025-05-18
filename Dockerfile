FROM node:20-alpine

WORKDIR /app

# Устанавливаем зависимости для сборки и запуска
RUN apk add --no-cache python3 make g++

# Порт для Medusa сервера
EXPOSE 9000

# Контейнер не запускает сервер напрямую
# Команда запуска определена в docker-compose.yml
CMD ["sh", "-c", "yarn install && yarn build && yarn start"] 