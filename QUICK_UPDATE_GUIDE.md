# 🚀 Краткая инструкция по обновлению проекта

## ⚡ Быстрое обновление (для DevOps)

### 1. Обновление из GitHub
```bash
# Переходим в директорию проекта
cd /path/to/ugodo_dev

# Сохраняем локальные изменения (если есть)
git stash

# Получаем последние изменения
git pull origin main

# Восстанавливаем локальные изменения (если нужно)
git stash pop
```

### 2. Развертывание

#### 🐳 Docker (рекомендуется)
```bash
# Полное пересоздание
docker compose down
docker compose build --no-cache
docker compose up -d

# Проверка статуса
docker compose ps
docker compose logs -f
```

#### 📦 PM2 (альтернатива)
```bash
# Backend
cd medusa
yarn install
yarn build
cd ..

# Frontend
yarn install
yarn build

# Перезапуск
pm2 restart all
pm2 status
```

### 3. Автоматическое развертывание
```bash
# Использовать готовый скрипт
./deploy.sh auto

# Или конкретный метод
./deploy.sh docker  # для Docker
./deploy.sh pm2     # для PM2
```

### 4. Проверка работоспособности
```bash
# Запуск мониторинга
./monitor.sh

# Ручная проверка
curl http://localhost:8000    # Frontend
curl http://localhost:9000    # Backend API
```

## 🔧 Решение проблем

### Git конфликты
```bash
# Автоматическое решение
./fix-git-divergent.sh auto

# Принудительное обновление (осторожно!)
./fix-git-divergent.sh force
```

### Проблемы с зависимостями
```bash
# Очистка кэша
yarn cache clean
rm -rf node_modules yarn.lock
yarn install

# Для backend
cd medusa
rm -rf node_modules yarn.lock
yarn install
```

### Проблемы с Docker
```bash
# Полная очистка
docker compose down -v --remove-orphans
docker system prune -a --volumes

# Пересборка
docker compose build --no-cache
docker compose up -d
```

### 🚨 Проблемы с Docker networking (iptables)

Если появляется ошибка:
```
failed to create network: Error response from daemon: Failed to Setup IP tables: Unable to enable ACCEPT OUTGOING rule
```

#### Быстрое решение:
```bash
# Автоматическое исправление (требует root)
sudo ./fix-docker-networking.sh auto

# Или пошагово:
sudo systemctl stop docker
sudo ./fix-docker-networking.sh clean-iptables
sudo systemctl start docker
```

#### Альтернативные методы:
```bash
# Метод 1: Перезапуск Docker
sudo systemctl restart docker

# Метод 2: Полная очистка Docker networking
sudo docker system prune -af --volumes
sudo systemctl restart docker

# Метод 3: Очистка iptables (осторожно!)
sudo iptables -F DOCKER
sudo iptables -F DOCKER-ISOLATION-STAGE-1
sudo iptables -F DOCKER-ISOLATION-STAGE-2
sudo systemctl restart docker

# Метод 4: Перезагрузка сервера (крайний случай)
sudo reboot
```

#### Проверка исправления:
```bash
# Тест Docker networking
./fix-docker-networking.sh test

# Ручная проверка
docker run --rm hello-world
docker compose up -d
```

## 📋 Чек-лист обновления

- [ ] Создана резервная копия
- [ ] Сохранены настройки (.env файлы)
- [ ] Обновлен код из GitHub
- [ ] Установлены зависимости
- [ ] Выполнена сборка
- [ ] Перезапущены сервисы
- [ ] Проверена работоспособность
- [ ] Проверены логи на ошибки
- [ ] **Docker networking работает без ошибок iptables**

## 🚨 Экстренное восстановление

Если что-то пошло не так:

```bash
# Откат к предыдущей версии
git log --oneline -10          # Найти последний рабочий коммит
git reset --hard <commit-hash> # Откатиться
./deploy.sh auto               # Развернуть

# Или через Docker
docker compose down
git reset --hard HEAD~1
sudo ./fix-docker-networking.sh auto  # Исправить networking
docker compose up -d
```

## 📞 Поддержка

При проблемах обращайтесь к:
- Логам: `./monitor.sh`
- Документации: `DEPLOY_GUIDE.md`
- Emergency guide: `EMERGENCY.md`
- **Docker networking**: `./fix-docker-networking.sh help` 