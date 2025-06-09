#!/bin/bash

# Скрипт для исправления проблем с Docker networking и iptables
# Автор: DevOps team
# Дата: 2024-12-10

set -e

echo "🔧 Исправление проблем с Docker networking..."

# Функция для логирования
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Функция для проверки root прав
check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo "❌ Этот скрипт должен запускаться от root"
        echo "Используйте: sudo $0"
        exit 1
    fi
}

# Функция для остановки Docker
stop_docker() {
    log "Остановка Docker..."
    systemctl stop docker || true
    systemctl stop docker.socket || true
}

# Функция для очистки Docker networks
cleanup_networks() {
    log "Очистка Docker networks..."
    
    # Удаляем все контейнеры (если есть)
    docker rm -f $(docker ps -aq) 2>/dev/null || true
    
    # Удаляем все networks кроме системных
    docker network ls --format "{{.Name}}" | grep -v -E "^(bridge|host|none)$" | xargs -r docker network rm 2>/dev/null || true
    
    # Полная очистка Docker системы
    docker system prune -af --volumes 2>/dev/null || true
}

# Функция для очистки iptables
cleanup_iptables() {
    log "Очистка iptables правил Docker..."
    
    # Удаляем Docker chains из iptables
    iptables -t nat -F DOCKER 2>/dev/null || true
    iptables -t nat -X DOCKER 2>/dev/null || true
    iptables -t filter -F DOCKER 2>/dev/null || true
    iptables -t filter -F DOCKER-ISOLATION-STAGE-1 2>/dev/null || true
    iptables -t filter -F DOCKER-ISOLATION-STAGE-2 2>/dev/null || true
    iptables -t filter -F DOCKER-USER 2>/dev/null || true
    iptables -t filter -X DOCKER 2>/dev/null || true
    iptables -t filter -X DOCKER-ISOLATION-STAGE-1 2>/dev/null || true
    iptables -t filter -X DOCKER-ISOLATION-STAGE-2 2>/dev/null || true
    iptables -t filter -X DOCKER-USER 2>/dev/null || true
    
    # Удаляем FORWARD правила
    iptables -D FORWARD -j DOCKER-USER 2>/dev/null || true
    iptables -D FORWARD -j DOCKER-ISOLATION-STAGE-1 2>/dev/null || true
    iptables -D FORWARD -o docker0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT 2>/dev/null || true
    iptables -D FORWARD -o docker0 -j DOCKER 2>/dev/null || true
    iptables -D FORWARD -i docker0 ! -o docker0 -j ACCEPT 2>/dev/null || true
    iptables -D FORWARD -i docker0 -o docker0 -j ACCEPT 2>/dev/null || true
}

# Функция для перезапуска сетевых сервисов
restart_networking() {
    log "Перезапуск сетевых сервисов..."
    
    # Перезапуск iptables (если используется)
    if command -v iptables-save &> /dev/null; then
        service iptables restart 2>/dev/null || true
    fi
    
    # Перезапуск сетевых сервисов
    systemctl restart networking 2>/dev/null || true
    systemctl restart systemd-networkd 2>/dev/null || true
    
    # Для некоторых систем
    service networking restart 2>/dev/null || true
}

# Функция для запуска Docker
start_docker() {
    log "Запуск Docker..."
    systemctl start docker
    systemctl enable docker
    
    # Ждем пока Docker полностью запустится
    sleep 5
    
    # Проверяем статус
    if systemctl is-active --quiet docker; then
        log "✅ Docker успешно запущен"
    else
        log "❌ Ошибка запуска Docker"
        exit 1
    fi
}

# Функция для проверки Docker networking
test_docker() {
    log "Тестирование Docker networking..."
    
    # Тестовый контейнер
    if docker run --rm hello-world >/dev/null 2>&1; then
        log "✅ Docker networking работает корректно"
    else
        log "❌ Проблемы с Docker networking остались"
        exit 1
    fi
}

# Основная функция
main() {
    case "${1:-auto}" in
        "auto")
            log "🚀 Автоматическое исправление Docker networking"
            check_root
            stop_docker
            cleanup_networks
            cleanup_iptables
            restart_networking
            start_docker
            test_docker
            log "✅ Исправление завершено успешно"
            ;;
        "restart-docker")
            log "🔄 Перезапуск Docker сервиса"
            check_root
            stop_docker
            start_docker
            ;;
        "clean-iptables")
            log "🧹 Очистка iptables правил Docker"
            check_root
            cleanup_iptables
            ;;
        "test")
            log "🧪 Тестирование Docker"
            test_docker
            ;;
        "help"|"-h"|"--help")
            echo "Использование: $0 [команда]"
            echo ""
            echo "Команды:"
            echo "  auto          - Полное автоматическое исправление (по умолчанию)"
            echo "  restart-docker - Перезапуск Docker сервиса"
            echo "  clean-iptables - Очистка iptables правил Docker"
            echo "  test          - Тестирование Docker networking"
            echo "  help          - Показать эту справку"
            ;;
        *)
            echo "❌ Неизвестная команда: $1"
            echo "Используйте: $0 help для справки"
            exit 1
            ;;
    esac
}

# Запуск
main "$@"
 