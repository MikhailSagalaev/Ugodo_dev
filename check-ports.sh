#!/bin/bash

echo "🔍 Проверка занятых портов..."

echo "=== Порт 9105 (MinIO API) ==="
sudo netstat -tulpn | grep :9105 || echo "Порт 9105 свободен"
sudo lsof -i :9105 || echo "Нет процессов на порту 9105"

echo ""
echo "=== Порт 9106 (MinIO Console) ==="
sudo netstat -tulpn | grep :9106 || echo "Порт 9106 свободен"
sudo lsof -i :9106 || echo "Нет процессов на порту 9106"

echo ""
echo "=== Порт 6379 (Redis) ==="
sudo netstat -tulpn | grep :6379 || echo "Порт 6379 свободен"
sudo lsof -i :6379 || echo "Нет процессов на порту 6379"

echo ""
echo "=== Все MinIO процессы ==="
ps aux | grep minio || echo "MinIO процессы не найдены"

echo ""
echo "=== Docker контейнеры ==="
docker ps -a

echo ""
echo "=== Docker networks ==="
docker network ls 