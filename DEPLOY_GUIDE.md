# 🚀 Полная инструкция по обновлению проекта Ugodo на сервере

## 📋 Обзор проекта

Ugodo - это полноценное ecommerce решение, состоящее из:
- **Frontend**: Next.js 15 приложение (порт 8000)
- **Backend**: Medusa.js 2.8.3 API сервер (порт 9000) 
- **Базы данных**: PostgreSQL + Redis
- **Хранилище файлов**: MinIO (S3-совместимое)
- **Аутентификация**: OTP через SMS с плагином @perseidesjs/auth-otp

## 🔧 Предварительные требования

### Системные требования
- Node.js >= 20.0.0
- npm >= 10.0.0  
- Yarn 1.22.22+
- Docker и Docker Compose
- PM2 (для production)
- Git

### Переменные окружения
Убедитесь, что на сервере настроены все необходимые переменные (см. `environment.example`):

```bash
# Основные переменные
DATABASE_URL=postgresql://username:password@localhost:5432/ugodo_db
REDIS_URL=redis://localhost:6379
MEDUSA_BACKEND_URL=https://api.ugodo.ru
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.ugodo.ru
JWT_SECRET=your-super-secret-jwt-key
COOKIE_SECRET=your-super-secret-cookie-key
```

## 🚀 Методы обновления

### 1. 🤖 Автоматическое обновление (Рекомендуется)

```bash
# Используйте автоматический скрипт
./deploy.sh auto    # Автоопределение метода
./deploy.sh docker  # Принудительно через Docker
./deploy.sh pm2     # Принудительно через PM2
```

**Возможности скрипта:**
- ✅ Автоматическое решение Git конфликтов
- ✅ Создание бэкапов базы данных
- ✅ Проверка работоспособности после обновления
- ✅ Автоматический откат при ошибках
- ✅ Цветной вывод с логированием

### 2. 🐳 Ручное обновление через Docker

```bash
# 1. Переходим в проект
cd /path/to/ugodo_dev

# 2. Решаем возможные Git проблемы
git config pull.rebase false
git fetch origin main
git reset --hard origin/main

# 3. Создаем бэкап БД (опционально)
pg_dump ugodo_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Пересобираем и запускаем
docker compose down
docker compose build --no-cache  
docker compose up -d

# 5. Проверяем работоспособность
curl http://localhost:8000
curl http://localhost:9000/store/products

# 6. Очищаем старые образы
docker image prune -af
```

### 3. ⚙️ Обновление без Docker (PM2)

#### Backend (Medusa):
```bash
cd /path/to/ugodo_dev/medusa

# Обновляем код с решением Git проблем
git pull origin main || (git fetch origin main && git reset --hard origin/main)

# Устанавливаем зависимости и собираем
yarn install --frozen-lockfile
yarn predeploy  # Выполняет миграции БД
yarn build

# Перезапускаем через PM2
pm2 restart medusa-server
```

#### Frontend (Next.js):
```bash
cd /path/to/ugodo_dev

# Обновляем код
git pull origin main || (git fetch origin main && git reset --hard origin/main)

# Устанавливаем зависимости и собираем
yarn install --frozen-lockfile
yarn build

# Перезапускаем
pm2 restart ugodo-frontend
pm2 save
```

## 🆘 Решение Git проблем

### Проблема "divergent branches"

**Быстрое решение (принудительное обновление):**
```bash
git fetch origin main
git reset --hard origin/main
```

**Альтернативные варианты:**
```bash
# Вариант 1: Настройка стратегии merge
git config pull.rebase false
git pull origin main

# Вариант 2: Использование rebase
git config pull.rebase true  
git pull origin main

# Вариант 3: Сохранение локальных изменений
git stash
git pull origin main
git stash pop  # если нужно вернуть изменения
```

### Проблемы с локальными изменениями

```bash
# Посмотреть какие файлы изменены
git status

# Удалить все локальные изменения
git reset --hard HEAD
git clean -fd

# Или сохранить изменения
git stash push -m "Backup before deploy"
```

## 🗃️ Управление базой данных

### Выполнение миграций:
```bash
cd medusa/
yarn predeploy  # Выполняет миграции перед деплоем
```

### Бэкап и восстановление:
```bash
# Создание бэкапа
pg_dump -h localhost -U username ugodo_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа  
psql -h localhost -U username -d ugodo_db < backup_file.sql

# Автоматический бэкап (добавить в crontab)
0 2 * * * pg_dump ugodo_db > /backups/ugodo_$(date +\%Y\%m\%d).sql
```

## 📊 Мониторинг и диагностика

### Встроенный мониторинг:
```bash
# Запуск мониторинга
./monitor.sh        # Одноразовая проверка
./monitor.sh watch  # Непрерывный мониторинг (обновление каждые 30 сек)
```

### Ручные проверки:
```bash
# Проверка сервисов
curl http://localhost:8000  # Frontend
curl http://localhost:9000  # Backend
curl http://localhost:9100  # MinIO

# Статус процессов
pm2 list
docker compose ps

# Логи
pm2 logs --lines 50
docker compose logs --tail=50
```

### Проверка ресурсов:
```bash
# Использование диска
df -h
du -sh /path/to/ugodo_dev

# Использование памяти
free -h

# Нагрузка на CPU
htop
```

## ⚠️ Устранение частых проблем

### 1. Ошибки портов
```bash
# Проверить занятые порты
netstat -tulpn | grep :8000
netstat -tulpn | grep :9000

# Освободить порт
sudo fuser -k 8000/tcp
sudo fuser -k 9000/tcp
```

### 2. Проблемы с правами
```bash
# Исправить права на файлы
sudo chown -R $USER:$USER /path/to/ugodo_dev
chmod -R 755 /path/to/ugodo_dev
```

### 3. Очистка Docker
```bash
# Полная очистка Docker
docker system prune -af
docker volume prune -f
docker network prune -f
```

### 4. Проблемы с зависимостями
```bash
# Очистка и переустановка
rm -rf node_modules yarn.lock package-lock.json
yarn install

# В medusa папке
cd medusa
rm -rf node_modules yarn.lock
yarn install
cd ..
```

### 5. Проблемы с PM2
```bash
# Полный сброс PM2
pm2 delete all
pm2 kill
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # для автозапуска
```

## 🔄 План аварийного восстановления

### В случае критической ошибки:

1. **Остановить все сервисы:**
   ```bash
   pm2 stop all
   docker compose down
   ```

2. **Откатиться к предыдущей версии:**
   ```bash
   git log --oneline -5  # Посмотреть последние коммиты
   git checkout HEAD~1   # Откат на 1 коммит назад
   ```

3. **Восстановить базу данных из бэкапа:**
   ```bash
   psql -h localhost -U username -d ugodo_db < latest_backup.sql
   ```

4. **Перезапустить сервисы:**
   ```bash
   ./deploy.sh auto
   # или
   pm2 start ecosystem.config.js
   docker compose up -d
   ```

## 📝 Чек-лист обновления

- [ ] Создать бэкап базы данных
- [ ] Проверить переменные окружения
- [ ] Решить Git конфликты если есть
- [ ] Обновить код из репозитория  
- [ ] Установить/обновить зависимости
- [ ] Выполнить миграции БД
- [ ] Собрать проект
- [ ] Перезапустить сервисы
- [ ] Проверить доступность всех эндпоинтов
- [ ] Проверить логи на ошибки
- [ ] Протестировать ключевые функции (регистрация, заказы)
- [ ] Проверить работу SMS OTP
- [ ] Уведомить команду об успешном обновлении

## 🔧 Автоматизация и CI/CD

### GitHub Actions

Проект настроен для автоматического развертывания:

1. При push в `main`/`master` ветки
2. Автоматическая сборка Docker образов
3. Развертывание на production сервере
4. Автоматический откат при ошибках

**Настройка GitHub Secrets:**
```
DOCKER_USERNAME=ваш-docker-username
DOCKER_PASSWORD=ваш-docker-password  
SERVER_HOST=IP-адрес-сервера
SERVER_USERNAME=пользователь-сервера
SSH_PRIVATE_KEY=приватный-ssh-ключ
```

### Настройка автоматических бэкапов

```bash
# Добавить в crontab (crontab -e)
0 2 * * * pg_dump ugodo_db > /backups/ugodo_$(date +\%Y\%m\%d).sql
0 3 * * 0 find /backups -name "ugodo_*.sql" -mtime +30 -delete
```

## 🛡️ Рекомендации по безопасности

1. **Всегда создавайте бэкапы перед обновлением**
2. **Тестируйте обновления на staging окружении**
3. **Используйте HTTPS в production**
4. **Регулярно обновляйте зависимости**
5. **Мониторьте логи безопасности**
6. **Ограничьте доступ к административным панелям**
7. **Используйте сильные пароли и ключи**
8. **Настройте фаервол для ограничения доступа**

## 📞 Поддержка

**При возникновении проблем:**

1. Запустите диагностику: `./monitor.sh`
2. Проверьте логи: `pm2 logs` или `docker compose logs`
3. Изучите раздел "Устранение проблем" выше
4. Используйте автоматический откат: `git checkout HEAD~1`
5. Обратитесь к команде разработки

**Контакты:**
- Email: admin@ugodo.ru
- Slack: #ugodo-support
- Документация: [README.md](./README.md)

---

## 💡 Дополнительные команды

```bash
# Просмотр версий
node --version
yarn --version  
docker --version
pm2 --version

# Мониторинг в реальном времени
watch -n 2 'curl -s http://localhost:8000 && echo "Frontend OK" || echo "Frontend ERROR"'

# Проверка SSL сертификата
openssl s_client -connect ugodo.ru:443 -servername ugodo.ru

# Анализ производительности
yarn analyze  # Анализ размера Next.js bundle
```

**🎉 Успешного развертывания!** 