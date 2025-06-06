#!/bin/bash

# 🔄 Обновление с сохранением конфигурационных файлов
# Использование: ./update-preserve-config.sh

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

# Файлы для сохранения (добавьте сюда нужные файлы)
PRESERVE_FILES=(
    "medusa/medusa-config.ts"
    "medusa/.env"
    ".env"
    "environment.local"
)

log "🔄 Обновление с сохранением конфигурационных файлов"

# Создаем временную папку для бэкапов
BACKUP_DIR=".config_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

log "📦 Сохраняем конфигурационные файлы..."

# Сохраняем существующие конфиги
for file in "${PRESERVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Создаем структуру папок в бэкапе
        backup_path="$BACKUP_DIR/$file"
        mkdir -p "$(dirname "$backup_path")"
        cp "$file" "$backup_path"
        success "Сохранен: $file"
    else
        log "Пропущен (не существует): $file"
    fi
done

log "🌐 Обновление кода из Git..."

# Сбрасываем yarn.lock (он пересоздастся)
if [ -f "medusa/yarn.lock" ]; then
    git checkout medusa/yarn.lock 2>/dev/null || true
fi

# Обновляемся принудительно
git fetch origin main
if git reset --hard origin/main; then
    success "Код обновлен успешно"
else
    error "Ошибка при обновлении Git"
    exit 1
fi

log "♻️  Восстанавливаем конфигурационные файлы..."

# Восстанавливаем сохраненные конфиги
for file in "${PRESERVE_FILES[@]}"; do
    backup_path="$BACKUP_DIR/$file"
    if [ -f "$backup_path" ]; then
        cp "$backup_path" "$file"
        success "Восстановлен: $file"
    fi
done

# Удаляем временный бэкап
rm -rf "$BACKUP_DIR"

log "📦 Обновление зависимостей..."

# Обновляем yarn.lock в medusa
cd medusa
if yarn install --frozen-lockfile 2>/dev/null || yarn install; then
    success "Зависимости medusa обновлены"
else
    warning "Ошибка при обновлении зависимостей medusa"
fi
cd ..

# Обновляем зависимости frontend
if yarn install --frozen-lockfile 2>/dev/null || yarn install; then
    success "Зависимости frontend обновлены"
else
    warning "Ошибка при обновлении зависимостей frontend"
fi

success "🎉 Обновление завершено! Конфигурационные файлы сохранены."

log "📊 Статус Git:"
git log --oneline -3

echo ""
log "🔧 Для применения изменений выполните:"
echo "  ./deploy.sh auto" 