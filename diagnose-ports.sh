#!/bin/bash

echo "=== ДИАГНОСТИКА ПОРТОВ ==="

echo "Проверка процессов на портах:"
echo "Порт 9102:"
netstat -tulpn | grep ":9102 " || echo "Порт 9102 свободен"

echo "Порт 9105:"
netstat -tulpn | grep ":9105 " || echo "Порт 9105 свободен"

echo "Порт 9106:"
netstat -tulpn | grep ":9106 " || echo "Порт 9106 свободен"

echo ""
echo "Все процессы с MinIO в названии:"
ps aux | grep -i minio | grep -v grep || echo "MinIO процессы не найдены"

echo ""
echo "Docker контейнеры:"
docker ps -a | grep minio || echo "MinIO контейнеры не найдены"

echo ""
echo "Docker сети:"
docker network ls | grep ugodo || echo "Ugodo сети не найдены" 