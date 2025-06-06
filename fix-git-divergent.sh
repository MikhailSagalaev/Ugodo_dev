#!/bin/bash

# 🔧 Скрипт для решения проблемы "divergent branches" в Git
# Использование: ./fix-git-divergent.sh [strategy]
# Стратегии: force, merge, rebase, stash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
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

# Проверка что мы в Git репозитории
if [ ! -d ".git" ]; then
    error "Ошибка: не найден Git репозиторий. Запустите скрипт из корня проекта."
    exit 1
fi

STRATEGY=${1:-auto}

log "🔧 Исправление проблемы с расходящимися ветками Git"
log "Стратегия: $STRATEGY"

# Показываем текущий статус
log "Текущий статус Git:"
git status --short

echo ""
log "Последние коммиты:"
git log --oneline -5

echo ""

case $STRATEGY in
    force)
        warning "🚨 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ (все локальные изменения будут потеряны!)"
        read -p "Вы уверены? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "Принудительное обновление до origin/main..."
            git fetch origin main
            git reset --hard origin/main
            success "Принудительное обновление завершено"
        else
            log "Операция отменена"
            exit 0
        fi
        ;;
        
    merge)
        log "Настройка стратегии merge и обновление..."
        git config pull.rebase false
        if git pull origin main; then
            success "Успешный merge с удаленной веткой"
        else
            error "Ошибка при merge. Возможно есть конфликты для разрешения."
            git status
            exit 1
        fi
        ;;
        
    rebase)
        log "Настройка стратегии rebase и обновление..."
        git config pull.rebase true
        if git pull origin main; then
            success "Успешный rebase на удаленную ветку"
        else
            error "Ошибка при rebase. Возможно есть конфликты для разрешения."
            git status
            exit 1
        fi
        ;;
        
    stash)
        log "Сохранение локальных изменений и обновление..."
        
        # Проверяем есть ли изменения для сохранения
        if git diff --quiet && git diff --cached --quiet; then
            log "Локальных изменений не обнаружено"
        else
            log "Сохраняем локальные изменения..."
            git stash push -m "Auto-stash before pull $(date)"
            success "Локальные изменения сохранены в stash"
        fi
        
        # Пытаемся обновиться
        git config pull.rebase false
        if git pull origin main; then
            success "Успешное обновление"
            
            # Предлагаем восстановить изменения
            if git stash list | grep -q "Auto-stash before pull"; then
                echo ""
                warning "Найдены сохраненные изменения в stash"
                read -p "Восстановить локальные изменения? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    if git stash pop; then
                        success "Локальные изменения восстановлены"
                    else
                        warning "Конфликт при восстановлении. Используйте 'git stash show' и 'git stash apply' вручную"
                    fi
                fi
            fi
        else
            error "Ошибка при обновлении"
            exit 1
        fi
        ;;
        
    auto)
        log "🤖 Автоматическое определение лучшей стратегии..."
        
        # Проверяем есть ли локальные изменения
        if ! git diff --quiet || ! git diff --cached --quiet; then
            log "Обнаружены локальные изменения, используем stash стратегию"
            $0 stash
        else
            log "Локальных изменений нет, пробуем простой merge"
            if ! $0 merge 2>/dev/null; then
                warning "Merge не удался, используем принудительное обновление"
                $0 force
            fi
        fi
        ;;
        
    *)
        error "Неизвестная стратегия: $STRATEGY"
        echo ""
        echo "Доступные стратегии:"
        echo "  force  - Принудительное обновление (потеря локальных изменений)"
        echo "  merge  - Merge с удаленной веткой"
        echo "  rebase - Rebase на удаленную ветку"
        echo "  stash  - Сохранить изменения, обновиться, восстановить"
        echo "  auto   - Автоматический выбор стратегии"
        echo ""
        echo "Пример: ./fix-git-divergent.sh merge"
        exit 1
        ;;
esac

echo ""
log "📊 Финальный статус:"
git status --short

echo ""
success "🎉 Проблема с Git решена!"
log "Текущая ветка: $(git branch --show-current)"
log "Последний коммит: $(git log --oneline -1)" 