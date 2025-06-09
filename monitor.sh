#!/bin/bash

# 📊 Скрипт мониторинга Ugodo сервисов
# Использование: ./monitor.sh [watch]

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функции для статуса
status_ok() {
    echo -e "${GREEN}✅ $1${NC}"
}

status_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

status_error() {
    echo -e "${RED}❌ $1${NC}"
}

status_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Функция проверки порта
check_port() {
    local port=$1
    local service=$2
    
    if curl -sf "http://localhost:$port" >/dev/null 2>&1; then
        status_ok "$service работает на порту $port"
        return 0
    else
        status_error "$service недоступен на порту $port"
        return 1
    fi
}

# Функция проверки API endpoint
check_api() {
    local url=$1
    local name=$2
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "404" ]; then
        status_ok "$name API отвечает (HTTP $response)"
        return 0
    else
        status_error "$name API недоступен (HTTP $response)"
        return 1
    fi
}

# Функция проверки базы данных
check_database() {
    if command -v psql &> /dev/null; then
        if psql -h localhost -U postgres -d ugodo_db -c "SELECT 1;" >/dev/null 2>&1; then
            status_ok "PostgreSQL база данных доступна"
        else
            status_warning "PostgreSQL база данных недоступна или требует настройки"
        fi
    else
        status_info "psql не найден, пропускаем проверку PostgreSQL"
    fi
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping | grep -q "PONG"; then
            status_ok "Redis доступен"
        else
            status_error "Redis недоступен"
        fi
    else
        status_info "redis-cli не найден, пропускаем проверку Redis"
    fi
}

# Функция проверки Docker контейнеров
check_docker() {
    if command -v docker &> /dev/null; then
        status_info "Docker контейнеры:"
        docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  Docker Compose не настроен"
    else
        status_info "Docker не найден"
    fi
}

# Функция проверки PM2 процессов
check_pm2() {
    if command -v pm2 &> /dev/null; then
        status_info "PM2 процессы:"
        pm2 list --no-color 2>/dev/null || echo "  PM2 процессы не найдены"
    else
        status_info "PM2 не найден"
    fi
}

# Функция проверки использования ресурсов
check_resources() {
    status_info "Использование ресурсов:"
    
    # CPU
    if command -v top &> /dev/null; then
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
        echo "  CPU: ${cpu_usage}%"
    fi
    
    # Память
    if command -v free &> /dev/null; then
        local memory_info=$(free -h | grep Mem)
        echo "  $memory_info"
    fi
    
    # Диск
    if command -v df &> /dev/null; then
        echo "  Диск:"
        df -h / | tail -n1 | awk '{print "    Корень: " $3 " / " $2 " (" $5 " используется)"}'
        if [ -d "/var/lib/docker" ]; then
            local docker_size=$(du -sh /var/lib/docker 2>/dev/null | cut -f1)
            echo "    Docker: $docker_size"
        fi
    fi
}

# Функция проверки логов
check_logs() {
    status_info "Последние ошибки в логах:"
    
    # PM2 логи
    if [ -f "logs/medusa-error.log" ]; then
        local medusa_errors=$(tail -n5 logs/medusa-error.log 2>/dev/null | grep -i error | wc -l)
        if [ "$medusa_errors" -gt 0 ]; then
            status_warning "Medusa: $medusa_errors ошибок в последних 5 записях"
        fi
    fi
    
    if [ -f "logs/frontend-error.log" ]; then
        local frontend_errors=$(tail -n5 logs/frontend-error.log 2>/dev/null | grep -i error | wc -l)
        if [ "$frontend_errors" -gt 0 ]; then
            status_warning "Frontend: $frontend_errors ошибок в последних 5 записях"
        fi
    fi
    
    # Docker логи
    if command -v docker &> /dev/null; then
        local docker_errors=$(docker compose logs --tail=10 2>/dev/null | grep -i error | wc -l)
        if [ "$docker_errors" -gt 0 ]; then
            status_warning "Docker: $docker_errors ошибок в последних 10 записях"
        fi
    fi
}

# Основная функция мониторинга
monitor() {
    clear
    echo "=================== 📊 UGODO МОНИТОРИНГ ==================="
    echo "Время проверки: $(date)"
    echo "=========================================================="
    echo
    
    status_info "🌐 Проверка веб-сервисов:"
    check_port 8000 "Frontend (Next.js)"
    check_port 9000 "Backend (Medusa)"
    check_port 9105 "MinIO (Storage)"
    echo
    
    status_info "🔌 Проверка API endpoints:"
    check_api "http://localhost:9000/store/products" "Store"
    check_api "http://localhost:9000/admin/products" "Admin"
    echo
    
    status_info "🗄️  Проверка баз данных:"
    check_database
    echo
    
    status_info "🐳 Проверка контейнеров и процессов:"
    check_docker
    echo
    check_pm2
    echo
    
    status_info "💾 Проверка ресурсов:"
    check_resources
    echo
    
    status_info "📋 Проверка логов:"
    check_logs
    echo
    
    echo "=========================================================="
    status_info "Мониторинг завершен. Для непрерывного мониторинга используйте: ./monitor.sh watch"
}

# Режим наблюдения
watch_mode() {
    while true; do
        monitor
        echo
        status_info "Обновление через 30 секунд... (Ctrl+C для выхода)"
        sleep 30
    done
}

# Основная логика
if [ "$1" = "watch" ]; then
    watch_mode
else
    monitor
fi 