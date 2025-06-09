#!/bin/bash

echo "🔍 Проверка занятых портов..."

echo "=== Порт 9100 (MinIO API) ==="
sudo netstat -tulpn | grep :9100 || echo "Порт 9100 свободен"
sudo lsof -i :9100 || echo "Нет процессов на порту 9100"

echo ""
echo "=== Порт 9101 (MinIO Console) ==="
sudo netstat -tulpn | grep :9101 || echo "Порт 9101 свободен"
sudo lsof -i :9101 || echo "Нет процессов на порту 9101"

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