# 🛍️ Ugodo - Современная E-commerce платформа

Ugodo - это полнофункциональная платформа электронной коммерции, построенная на современном стеке технологий.

## 🏗️ Архитектура

- **Frontend**: Next.js 15 с React 19 RC
- **Backend**: Medusa.js 2.8.3 
- **База данных**: PostgreSQL + Redis
- **Хранилище**: MinIO (S3-совместимое)
- **Аутентификация**: OTP через SMS (@perseidesjs/auth-otp)
- **UI**: HeroUI компоненты
- **Стилизация**: Tailwind CSS

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Клонируем репозиторий
git clone <repository-url>
cd ugodo_dev

# Устанавливаем зависимости
yarn install

# Запускаем базы данных
yarn docker:up

# Запускаем backend
cd medusa
yarn dev

# В новом терминале запускаем frontend
cd ..
yarn dev
```

### Production развертывание

Для развертывания на production сервере используйте наши автоматизированные инструкции:

#### 📖 Документация по развертыванию

- **[QUICK_UPDATE_GUIDE.md](./QUICK_UPDATE_GUIDE.md)** - ⚡ Краткая инструкция по обновлению проекта
- **[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)** - Полная инструкция по развертыванию
- **[environment.example](./environment.example)** - Пример переменных окружения

#### 🛠️ Инструменты автоматизации

- **`./deploy.sh`** - Автоматический скрипт развертывания
  ```bash
  ./deploy.sh auto    # Автоопределение метода
  ./deploy.sh docker  # Развертывание через Docker
  ./deploy.sh pm2     # Развертывание через PM2
  ```

- **`./monitor.sh`** - Скрипт мониторинга сервисов
  ```bash
  ./monitor.sh        # Одноразовая проверка
  ./monitor.sh watch  # Непрерывный мониторинг
  ```

- **`./fix-git-divergent.sh`** - Решение Git проблем
  ```bash
  ./fix-git-divergent.sh auto   # Автоматическое решение
  ./fix-git-divergent.sh force  # Принудительное обновление
  ./fix-git-divergent.sh stash  # Сохранить изменения
  ```

#### ⚡ Быстрое обновление

```bash
# Docker
docker compose down && docker compose build --no-cache && docker compose up -d

# PM2
cd medusa && yarn install && yarn predeploy && yarn build && cd ..
yarn install && yarn build && pm2 restart all
```

## 🔧 Конфигурация

### Переменные окружения

Скопируйте `environment.example` в `.env` и настройте под ваше окружение:

```bash
cp environment.example .env
# Отредактируйте .env файл
```

### Docker Compose

Проект включает готовую конфигурацию Docker Compose с сервисами:
- Redis (порт 6379)
- MinIO (порты 9100, 9101)

### PM2 конфигурация

Файл `ecosystem.config.js` настроен для запуска:
- Medusa backend (порт 9000)
- Next.js frontend (порт 8000)

## 🌐 Доступные сервисы

После запуска доступны следующие сервисы:

- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:9000
- **Admin панель**: http://localhost:9000/app
- **MinIO Console**: http://localhost:9101
- **API документация**: http://localhost:9000/doc/storefront

## 📊 Мониторинг

Используйте встроенные инструменты мониторинга:

```bash
# Проверка статуса сервисов
./monitor.sh

# Логи PM2
pm2 logs

# Логи Docker
docker compose logs -f

# Проверка здоровья API
curl http://localhost:8000
curl http://localhost:9000/store/products
```

## 🔄 CI/CD

Проект настроен для автоматического развертывания через GitHub Actions:

1. При push в `main`/`master` ветки
2. Автоматическая сборка Docker образов
3. Развертывание на production сервере
4. Автоматический откат при ошибках

Настройте GitHub Secrets:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `SERVER_HOST`
- `SERVER_USERNAME`
- `SSH_PRIVATE_KEY`

## 🛡️ Безопасность

- JWT токены для аутентификации
- CORS настройки для production
- Безопасные cookie настройки
- OTP аутентификация через SMS
- Изолированные Docker контейнеры

## 📝 Разработка

### Структура проекта

```
ugodo_dev/
├── src/                    # Frontend (Next.js)
├── medusa/                 # Backend (Medusa.js)
├── public/                 # Статические файлы
├── docs/                   # Документация
├── deploy.sh              # Скрипт развертывания
├── monitor.sh             # Скрипт мониторинга
├── ecosystem.config.js    # PM2 конфигурация
├── docker-compose.yml     # Docker конфигурация
└── .github/workflows/     # CI/CD пайплайны
```

### Команды разработки

```bash
# Frontend
yarn dev          # Запуск в режиме разработки
yarn build        # Сборка для production
yarn start        # Запуск production сборки

# Backend
cd medusa
yarn dev          # Запуск в режиме разработки
yarn build        # Сборка
yarn start        # Запуск production

# Docker
yarn docker:build    # Сборка образов
yarn docker:up       # Запуск контейнеров
yarn docker:down     # Остановка контейнеров
yarn docker:logs     # Просмотр логов
```

## 🤝 Поддержка

При возникновении проблем:

1. Проверьте логи: `./monitor.sh`
2. Изучите документацию: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
3. Используйте автоматический откат: `git checkout HEAD~1`
4. Обратитесь к команде разработки

## 📄 Лицензия

MIT License - см. файл [LICENSE](./LICENSE)

---

**Ugodo** - Ваш надежный партнер в мире электронной коммерции 🛍️ 