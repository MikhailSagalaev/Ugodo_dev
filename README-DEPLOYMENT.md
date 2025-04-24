# Инструкция по деплою Medusa

## Настройка CI/CD с использованием GitHub Actions и Docker

### Предварительные требования

1. Аккаунт на Docker Hub
2. Сервер с установленным Docker и docker-compose
3. SSH доступ к серверу
4. Репозиторий на GitHub

### Шаг 1: Настройка секретов GitHub

В настройках вашего GitHub-репозитория добавьте следующие секреты:

- `DOCKER_USERNAME`: Имя пользователя Docker Hub
- `DOCKER_PASSWORD`: Пароль от Docker Hub
- `SERVER_HOST`: IP-адрес вашего сервера (например, 89.108.110.26)
- `SERVER_USERNAME`: Имя пользователя SSH
- `SSH_PRIVATE_KEY`: Приватный SSH-ключ для доступа к серверу

### Шаг 2: Настройка сервера

1. Создайте директорию для проекта на сервере:

```bash
mkdir -p /path/to/deployment
cd /path/to/deployment
```

2. Создайте файл `.env` с переменными окружения:

```bash
cp .env.prod .env
nano .env  # Отредактируйте значения под ваше окружение
```

3. Скопируйте файл `docker-compose.prod.yml` на сервер:

```bash
scp docker-compose.prod.yml user@your-server:/path/to/deployment/docker-compose.yml
```

### Шаг 3: Запуск CI/CD

1. Убедитесь, что в вашем репозитории есть файлы:
   - `Dockerfile`
   - `docker-compose.yml` (для локальной разработки)
   - `docker-compose.prod.yml` (для продакшн)
   - `.github/workflows/deploy.yml`

2. Сделайте коммит и отправьте изменения в ветку main или master:

```bash
git add .
git commit -m "Setup CI/CD for Medusa"
git push origin main
```

3. GitHub Actions автоматически запустит процесс сборки и деплоя.

### Шаг 4: Проверка работоспособности

После завершения деплоя проверьте:

1. Доступность админки: `http://89.108.110.26:9000/app`
2. Доступность API: `http://89.108.110.26:9000/store/products`

### Ручной деплой (при необходимости)

Если вам нужно выполнить деплой вручную:

1. Соберите образ Docker:

```bash
docker build -t yourusername/medusa-app:latest .
```

2. Отправьте образ в Docker Hub:

```bash
docker push yourusername/medusa-app:latest
```

3. На сервере:

```bash
cd /path/to/deployment
docker-compose pull
docker-compose down
docker-compose up -d
```

### Настройка админки

Убедитесь, что в файле `medusa-config.ts` добавлена конфигурация для админки:

```typescript
admin: {
  backendUrl: process.env.MEDUSA_BACKEND_URL,
},
```

### Устранение неполадок

1. Если админка не открывается, проверьте:
   - Правильность CORS настроек
   - Логи контейнера: `docker-compose logs medusa`
   - Доступность базы данных: `docker-compose logs postgres`

2. Если API недоступен:
   - Проверьте настройки сети
   - Убедитесь, что порт 9000 открыт в фаерволе сервера 