# Настройка MinIO для Medusa с Git-обновлениями

## 1. Клонирование репозитория на сервер

Если вы еще не клонировали репозиторий на сервер:
```bash
git clone https://your-repo-url.git /path/to/ugodo
cd /path/to/ugodo
```

## 2. Настройка переменных окружения

Создайте или отредактируйте файл `.env` в директории `medusa/`:
```
# Основные настройки
DATABASE_URL=postgres://postgres:postgres@postgres:5432/medusa-db
REDIS_URL=redis://redis:6379
STORE_CORS=http://localhost:8000,http://89.108.110.26:8000,https://ugodo.ru
ADMIN_CORS=http://localhost:9000,http://89.108.110.26:9000,https://ugodo.ru
AUTH_CORS=http://localhost:9000,http://89.108.110.26:9000,http://localhost:8000,http://89.108.110.26:8000,https://ugodo.ru
# ВАЖНО: Правильный URL для отображения миниатюр
MEDUSA_BACKEND_URL=https://ugodo.ru
JWT_SECRET=your-secure-jwt-secret
COOKIE_SECRET=your-secure-cookie-secret

# MinIO конфигурация
MINIO_FILE_URL=https://ugodo.ru/minio
MINIO_ACCESS_KEY_ID=minioadmin
MINIO_SECRET_ACCESS_KEY=minioadmin
MINIO_BUCKET=medusa-uploads
MINIO_ENDPOINT=http://minio:9000
```

## 3. Запуск Docker-контейнеров

```bash
# Перейдите в корневую директорию проекта
cd /path/to/ugodo

# Запустите контейнеры
docker-compose up -d
```

## 4. Создание бакета в MinIO

1. Откройте MinIO консоль по адресу `https://ugodo.ru/minio-console/` 
2. Войдите, используя учетные данные:
   - Логин: `minioadmin`
   - Пароль: `minioadmin`
3. Создайте новый бакет `medusa-uploads`
4. Настройте бакет:
   - Установите "Access Policy" на "public"
   - Включите "Object Locking" при необходимости

## 5. Настройка Nginx

Скопируйте содержимое файла `nginx-minio-config.conf` в ваш конфигурационный файл Nginx:

```bash
# На Ubuntu: 
sudo cp nginx-minio-config.conf /etc/nginx/sites-available/ugodo.ru
sudo ln -s /etc/nginx/sites-available/ugodo.ru /etc/nginx/sites-enabled/
sudo nginx -t  # Проверка конфигурации
sudo systemctl reload nginx  # Применение изменений
```

## 6. Процесс обновления кода

Поскольку контейнер Medusa монтирует код как volume, вы можете обновлять код через Git:

```bash
cd /path/to/ugodo
git pull
# Перезапустите контейнер, чтобы применить изменения
docker-compose restart medusa
```

## 7. Мониторинг логов

```bash
# Просмотр логов контейнера Medusa
docker-compose logs -f medusa

# Просмотр логов MinIO
docker-compose logs -f minio
```

## 8. Возможные проблемы и решения

### Миниатюры всё еще не отображаются в админке
Убедитесь, что:
1. В `.env` установлено `MEDUSA_BACKEND_URL=https://ugodo.ru`
2. MinIO работает и доступен по URL `https://ugodo.ru/minio/`
3. Бакет `medusa-uploads` создан и имеет публичный доступ
4. Nginx настроен правильно для проксирования запросов к MinIO

### Ошибки доступа к файлам
Убедитесь, что:
1. Бакет MinIO доступен публично
2. CORS настроен правильно в MinIO (может потребоваться дополнительная настройка)
3. Пути к файлам формируются корректно 