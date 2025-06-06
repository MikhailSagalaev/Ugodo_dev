# ⚡ Быстрое обновление Ugodo

## 🚀 Автоматическое обновление

```bash
# Автоматическое развертывание (рекомендуется)
./deploy.sh auto

# Или конкретным методом
./deploy.sh docker  # Через Docker
./deploy.sh pm2     # Через PM2
```

## 🔄 Ручное обновление

### Docker развертывание:
```bash
cd /path/to/ugodo_dev

# Решаем проблему с Git если есть
git config pull.rebase false
git fetch origin main && git reset --hard origin/main

# Пересобираем и запускаем
docker compose down && docker compose build --no-cache && docker compose up -d
```

### PM2 развертывание:

**Backend:**
```bash
cd /path/to/ugodo_dev/medusa
git pull origin main || (git fetch origin main && git reset --hard origin/main)
yarn install && yarn predeploy && yarn build
pm2 restart medusa-server
```

**Frontend:**
```bash
cd /path/to/ugodo_dev  
git pull origin main || (git fetch origin main && git reset --hard origin/main)
yarn install && yarn build
pm2 restart ugodo-frontend
```

## 🆘 Решение Git проблем

### Расходящиеся ветки:
```bash
# Ошибка: "You have divergent branches..."

# Быстрое решение (принудительное обновление):
git fetch origin main
git reset --hard origin/main

# Или настройка стратегии:
git config pull.rebase false
git pull origin main
```

### Локальные изменения:
```bash
# Сохранить изменения и обновиться:
git stash
git pull origin main
git stash pop  # если нужно вернуть изменения

# Или удалить локальные изменения:
git reset --hard HEAD
git pull origin main
```

## 🩺 Быстрая диагностика

```bash
# Проверка сервисов
./monitor.sh

# Проверка портов
curl http://localhost:8000  # Frontend
curl http://localhost:9000  # Backend  
curl http://localhost:9100  # MinIO

# Статус процессов
pm2 list
docker compose ps

# Логи
pm2 logs --lines 20
docker compose logs --tail=20
```

## ⚡ Экстренные команды

```bash
# Полная остановка
pm2 stop all && docker compose down

# Экстренный откат
git checkout HEAD~1
./deploy.sh auto

# Принудительная очистка
docker system prune -af
rm -rf node_modules && yarn install
```

---
📖 **Полная документация**: [README.md](./README.md) 