#!/usr/bin/env bash

set -e

echo "=== Обновление пакетов ==="
sudo apt-get update -y
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

echo "=== Добавление GPG-ключа Docker ==="
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "=== Добавление репозитория Docker ==="
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "=== Установка Docker ==="
sudo apt-get update -y
sudo apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

echo "=== Включение Docker при старте системы ==="
sudo systemctl enable docker
sudo systemctl start docker

echo "=== Добавление пользователя в группу docker ==="
sudo usermod -aG docker $USER

echo "=== Проверка версий ==="
docker --version
docker compose version

echo
echo "⚠️  ВАЖНО:"
echo "Перезайдите в систему или выполните:"
echo "newgrp docker"
echo

echo "=== Сборка и запуск docker-compose ==="
docker compose up -d --build

echo
echo "=== Готово ==="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080"
echo "Postgres: localhost:5432"
