#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== ДИАГНОСТИКА И ИСПРАВЛЕНИЕ КОНФЛИКТОВ ПОРТОВ ===${NC}"

# Функция для проверки занятых портов
check_ports() {
    echo -e "\n${YELLOW}🔍 Проверка занятых портов...${NC}"
    
    # Порты которые нас интересуют
    ports=(6379 9000 9001 9102 9105 9106 8000)
    
    for port in "${ports[@]}"; do
        if netstat -tulpn | grep ":$port " >/dev/null 2>&1; then
            process=$(netstat -tulpn | grep ":$port ")
            echo -e "${RED}❌ Порт $port занят: $process${NC}"
        else
            echo -e "${GREEN}✅ Порт $port свободен${NC}"
        fi
    done
}

# Функция для остановки всех Docker контейнеров
stop_all_containers() {
    echo -e "\n${YELLOW}🛑 Остановка всех Docker контейнеров...${NC}"
    
    # Остановить все контейнеры
    docker stop $(docker ps -aq) 2>/dev/null || echo "Нет запущенных контейнеров"
    
    # Удалить все контейнеры
    docker rm $(docker ps -aq) 2>/dev/null || echo "Нет контейнеров для удаления"
    
    # Удалить все сети (кроме системных)
    docker network prune -f
    
    echo -e "${GREEN}✅ Все контейнеры остановлены и удалены${NC}"
}

# Функция для очистки Docker системы
clean_docker() {
    echo -e "\n${YELLOW}🧹 Очистка Docker системы...${NC}"
    
    # Удалить неиспользуемые образы
    docker image prune -f
    
    # Удалить неиспользуемые тома
    docker volume prune -f
    
    # Удалить неиспользуемые сети
    docker network prune -f
    
    # Полная очистка системы
    docker system prune -f
    
    echo -e "${GREEN}✅ Docker система очищена${NC}"
}

# Функция для завершения процессов на конкретных портах
kill_port_processes() {
    echo -e "\n${YELLOW}💀 Завершение процессов на портах 9102, 9105, 9106...${NC}"
    
    # Порты которые нужно освободить
    conflict_ports=(9102 9105 9106)
    
    for port in "${conflict_ports[@]}"; do
        pid=$(netstat -tulpn | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
        if [ ! -z "$pid" ] && [ "$pid" != "-" ]; then
            echo -e "${YELLOW}Завершение процесса $pid на порту $port...${NC}"
            kill -9 $pid 2>/dev/null
            sleep 1
            
            # Проверяем снова
            if netstat -tulpn | grep ":$port " >/dev/null 2>&1; then
                echo -e "${RED}❌ Порт $port все еще занят${NC}"
            else
                echo -e "${GREEN}✅ Порт $port освобожден${NC}"
            fi
        else
            echo -e "${GREEN}✅ Порт $port уже свободен${NC}"
        fi
    done
}

# Функция для проверки docker-compose файла
check_compose_config() {
    echo -e "\n${YELLOW}📋 Проверка конфигурации docker-compose.yml...${NC}"
    
    if [ -f "docker-compose.yml" ]; then
        echo -e "${GREEN}✅ Файл docker-compose.yml найден${NC}"
        
        # Проверяем порты MinIO
        minio_ports=$(grep -A 10 "minio:" docker-compose.yml | grep "ports:" -A 5 | grep -E "\d+:\d+")
        echo -e "${BLUE}Порты MinIO в конфигурации:${NC}"
        echo "$minio_ports"
        
        # Проверяем синтаксис
        if docker-compose config >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Синтаксис docker-compose.yml корректен${NC}"
        else
            echo -e "${RED}❌ Ошибка в синтаксисе docker-compose.yml${NC}"
            docker-compose config
            return 1
        fi
    else
        echo -e "${RED}❌ Файл docker-compose.yml не найден${NC}"
        return 1
    fi
}

# Функция для запуска сервисов
start_services() {
    echo -e "\n${YELLOW}🚀 Запуск сервисов...${NC}"
    
    # Создать сеть если не существует
    docker network create medusa-network 2>/dev/null || echo "Сеть medusa-network уже существует"
    
    # Запустить сервисы
    if docker-compose up -d; then
        echo -e "${GREEN}✅ Сервисы запущены успешно${NC}"
        
        # Проверить статус контейнеров
        sleep 5
        echo -e "\n${BLUE}Статус контейнеров:${NC}"
        docker-compose ps
        
        # Проверить логи MinIO
        echo -e "\n${BLUE}Логи MinIO (последние 10 строк):${NC}"
        docker-compose logs --tail=10 minio
        
    else
        echo -e "${RED}❌ Ошибка при запуске сервисов${NC}"
        echo -e "\n${BLUE}Логи ошибок:${NC}"
        docker-compose logs
        return 1
    fi
}

# Функция для тестирования подключения
test_services() {
    echo -e "\n${YELLOW}🧪 Тестирование сервисов...${NC}"
    
    # Тест Redis
    if docker exec ugodo_dev-redis-1 redis-cli ping >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis работает${NC}"
    else
        echo -e "${RED}❌ Redis не отвечает${NC}"
    fi
    
    # Тест MinIO (проверка портов)
    if curl -f http://localhost:9105/minio/health/live >/dev/null 2>&1; then
        echo -e "${GREEN}✅ MinIO API (9105) работает${NC}"
    else
        echo -e "${RED}❌ MinIO API (9105) не отвечает${NC}"
    fi
    
    # Проверка консоли MinIO
    if curl -f http://localhost:9106 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ MinIO Console (9106) доступна${NC}"
    else
        echo -e "${YELLOW}⚠️  MinIO Console (9106) может быть недоступна (это нормально)${NC}"
    fi
}

# Основная функция
main() {
    echo -e "${BLUE}Начинаем диагностику и исправление...${NC}"
    
    # 1. Проверка текущего состояния
    check_ports
    check_compose_config || exit 1
    
    # 2. Остановка всех контейнеров
    stop_all_containers
    
    # 3. Завершение процессов на конфликтных портах
    kill_port_processes
    
    # 4. Очистка Docker
    clean_docker
    
    # 5. Повторная проверка портов
    echo -e "\n${YELLOW}🔍 Повторная проверка портов после очистки...${NC}"
    check_ports
    
    # 6. Запуск сервисов
    start_services || exit 1
    
    # 7. Тестирование
    test_services
    
    echo -e "\n${GREEN}🎉 Исправление завершено!${NC}"
    echo -e "${BLUE}MinIO API: http://localhost:9105${NC}"
    echo -e "${BLUE}MinIO Console: http://localhost:9106${NC}"
    echo -e "${BLUE}Redis: http://localhost:6379${NC}"
}

# Запуск основной функции
main "$@" 