# 🆘 Экстренные команды Ugodo

## 🚨 Критические ситуации

### Сайт недоступен
```bash
# Быстрая диагностика
./monitor.sh

# Проверка портов
curl -I http://localhost:8000
curl -I http://localhost:9000

# Перезапуск всех сервисов
pm2 restart all
docker compose restart
```

### Git проблемы ("divergent branches")
```bash
# Автоматическое решение
./fix-git-divergent.sh auto

# Или принудительное обновление
git fetch origin main && git reset --hard origin/main
```

### Откат к предыдущей версии
```bash
# Откат кода
git log --oneline -5  # Посмотреть коммиты
git checkout HEAD~1   # Откат на 1 коммит

# Быстрое развертывание
./deploy.sh auto
```

### Полный сброс системы
```bash
# Остановить все
pm2 stop all
docker compose down

# Очистить Docker
docker system prune -af
docker volume prune -f

# Очистить зависимости
rm -rf node_modules medusa/node_modules
yarn install
cd medusa && yarn install && cd ..

# Запустить заново
./deploy.sh auto
```

## 🔧 Быстрые фиксы

### База данных недоступна
```bash
# Проверить статус PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql

# Проверить Redis
redis-cli ping
sudo systemctl restart redis
```

### Проблемы с памятью
```bash
# Освободить память
pm2 restart all --update-env
docker compose restart

# Проверить использование
free -h
df -h
```

### Порты заняты
```bash
# Найти процессы на портах
sudo lsof -i :8000
sudo lsof -i :9000

# Убить процессы
sudo fuser -k 8000/tcp
sudo fuser -k 9000/tcp
```

## 📞 Контакты экстренной помощи

- **Команда разработки**: admin@ugodo.ru
- **Slack**: #ugodo-emergency
- **Телефон**: +7-XXX-XXX-XXXX

## 📋 Последовательность действий при сбое

1. **Диагностика**: `./monitor.sh`
2. **Проверка логов**: `pm2 logs` или `docker compose logs`
3. **Простой перезапуск**: `pm2 restart all`
4. **Откат версии**: `git checkout HEAD~1 && ./deploy.sh auto`
5. **Полный сброс**: см. "Полный сброс системы" выше
6. **Обращение в поддержку** если проблема не решена

---
📖 **Полная документация**: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) 