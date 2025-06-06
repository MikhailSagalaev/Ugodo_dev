#!/bin/bash

# 🚀 Скрипт автоматического обновления Ugodo
# Использование: ./deploy.sh [docker|pm2|auto]

set -e  # Выходить при любой ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка аргументов
DEPLOY_TYPE=${1:-auto}

log "Начинаем обновление Ugodo (тип: $DEPLOY_TYPE)"

# Проверка рабочей директории
if [ ! -f "package.json" ] || [ ! -d "medusa" ]; then
    error "Запустите скрипт из корневой директории проекта Ugodo"
    exit 1
fi

# Создание директории для логов
mkdir -p logs

# Функция безопасного обновления Git
safe_git_pull() {
    log "Обновление кода из Git..."
    
    # Проверяем статус Git
    if git status --porcelain | grep -q .; then
        warning "Обнаружены локальные изменения, сохраняем их..."
        git stash push -m "Auto-stash before deploy $(date)"
    fi
    
    # Пытаемся выполнить pull
    if ! git pull origin main 2>/dev/null; then
        warning "Обнаружены расходящиеся ветки, применяем принудительное обновление..."
        
        # Настраиваем стратегию pull (merge)
        git config pull.rebase false
        
        # Пытаемся снова
        if ! git pull origin main 2>/dev/null; then
            warning "Стандартный pull не удался, применяем принудительное обновление..."
            git fetch origin main
            git reset --hard origin/main
        fi
        
        success "Код обновлен принудительно"
    else
        success "Код обновлен успешно"
    fi
}

# Функция создания бэкапа БД
backup_database() {
    if command -v pg_dump &> /dev/null; then
        local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
        log "Создаем бэкап базы данных: $backup_file"
        
        if pg_dump -h localhost -U postgres ugodo_db > "$backup_file" 2>/dev/null; then
            success "Бэкап создан: $backup_file"
        else
            warning "Не удалось создать бэкап БД (возможно, БД не настроена локально)"
        fi
    else
        warning "pg_dump не найден, пропускаем создание бэкапа"
    fi
}

# Функция проверки работоспособности
health_check() {
    log "Проверка работоспособности сервисов..."
    
    # Ждем запуска
    sleep 15
    
    # Проверяем frontend
    if curl -sf http://localhost:8000 >/dev/null; then
        success "Frontend работает (порт 8000)"
    else
        error "Frontend недоступен на порту 8000"
        return 1
    fi
    
    # Проверяем backend
    if curl -sf http://localhost:9000/store/products >/dev/null; then
        success "Backend работает (порт 9000)"
    else
        error "Backend недоступен на порту 9000"
        return 1
    fi
    
    success "Все сервисы работают корректно!"
}

# Docker развертывание
deploy_docker() {
    log "Развертывание через Docker..."
    
    # Обновляем код
    safe_git_pull
    
    # Создаем бэкап
    backup_database
    
    # Останавливаем старые контейнеры
    log "Остановка старых контейнеров..."
    docker compose down
    
    # Собираем новые образы
    log "Сборка новых Docker образов..."
    docker compose build --no-cache
    
    # Запускаем контейнеры
    log "Запуск обновленных контейнеров..."
    docker compose up -d
    
    # Проверяем работоспособность
    health_check
    
    # Очищаем старые образы
    log "Очистка неиспользуемых Docker образов..."
    docker image prune -af
    docker volume prune -f
}

# PM2 развертывание
deploy_pm2() {
    log "Развертывание через PM2..."
    
    # Проверяем наличие PM2
    if ! command -v pm2 &> /dev/null; then
        error "PM2 не установлен. Установите: npm install -g pm2"
        exit 1
    fi
    
    # Обновляем код
    safe_git_pull
    
    # Создаем бэкап
    backup_database
    
    # Обновляем backend
    log "Обновление backend (Medusa)..."
    cd medusa
    yarn install --frozen-lockfile
    yarn predeploy  # Миграции БД
    yarn build
    cd ..
    
    # Обновляем frontend
    log "Обновление frontend (Next.js)..."
    yarn install --frozen-lockfile
    yarn build
    
    # Перезапускаем через PM2
    log "Перезапуск сервисов через PM2..."
    
    # Останавливаем старые процессы
    pm2 stop all || true
    
    # Запускаем новые процессы
    pm2 start ecosystem.config.js
    pm2 save
    
    # Проверяем работоспособность
    health_check
}

# Автоматическое определение метода развертывания
deploy_auto() {
    if command -v docker &> /dev/null && [ -f "docker-compose.yml" ]; then
        log "Обнаружен Docker, используем Docker развертывание"
        deploy_docker
    elif command -v pm2 &> /dev/null; then
        log "Обнаружен PM2, используем PM2 развертывание"
        deploy_pm2
    else
        error "Не найдены ни Docker, ни PM2. Установите один из них для развертывания."
        exit 1
    fi
}

# Функция отката
rollback() {
    error "Развертывание не удалось, выполняем откат..."
    
    # Откатываем код
    git checkout HEAD~1
    
    if [ "$DEPLOY_TYPE" = "docker" ]; then
        docker compose build --no-cache
        docker compose up -d
    elif [ "$DEPLOY_TYPE" = "pm2" ]; then
        cd medusa && yarn install && yarn build && cd ..
        yarn install && yarn build
        pm2 restart all
    fi
    
    error "Выполнен откат к предыдущей версии"
    exit 1
}

# Основная логика
case $DEPLOY_TYPE in
    docker)
        deploy_docker || rollback
        ;;
    pm2)
        deploy_pm2 || rollback
        ;;
    auto)
        deploy_auto || rollback
        ;;
    *)
        error "Неизвестный тип развертывания: $DEPLOY_TYPE"
        echo "Используйте: ./deploy.sh [docker|pm2|auto]"
        exit 1
        ;;
esac

success "🎉 Обновление Ugodo завершено успешно!"
log "Frontend доступен на: http://localhost:8000"
log "Backend доступен на: http://localhost:9000"
log "Админ панель доступна на: http://localhost:9000/app" 