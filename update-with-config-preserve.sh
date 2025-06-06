#!/bin/bash

echo "🚀 Быстрое обновление кода с сохранением конфигурации..."

# Переходим в директорию medusa
cd medusa

# Проверяем, есть ли изменения в medusa-config.ts
if git diff --name-only | grep -q "medusa-config.ts"; then
    echo "📋 Сохраняем конфигурацию medusa-config.ts..."
    cp medusa/medusa-config.ts /tmp/medusa-config.ts.backup
    
    echo "🔄 Сбрасываем изменения в конфигурации..."
    git checkout -- medusa/medusa-config.ts
fi

echo "⬇️ Обновляем код из GitHub..."
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Код успешно обновлен!"
    
    # Восстанавливаем конфигурацию если была сохранена
    if [ -f "/tmp/medusa-config.ts.backup" ]; then
        echo "📋 Восстанавливаем конфигурацию..."
        cp /tmp/medusa-config.ts.backup medusa/medusa-config.ts
        rm /tmp/medusa-config.ts.backup
    fi
    
    echo "📦 Обновляем зависимости..."
    yarn install
    
    echo "🔄 Перезапускаем сервисы..."
    pm2 restart ecosystem.config.js
    
    echo "📊 Проверяем статус..."
    pm2 status
    
    echo "🎉 Обновление завершено успешно!"
else
    echo "❌ Ошибка при обновлении кода"
    
    # Восстанавливаем конфигурацию при ошибке
    if [ -f "/tmp/medusa-config.ts.backup" ]; then
        echo "📋 Восстанавливаем конфигурацию после ошибки..."
        cp /tmp/medusa-config.ts.backup medusa/medusa-config.ts
        rm /tmp/medusa-config.ts.backup
    fi
    
    exit 1
fi 