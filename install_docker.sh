#!/bin/bash

set -e  # Остановка при ошибке

echo "=========================================="
echo "Установка Docker и зависимостей"
echo "=========================================="
echo ""

# Проверка, что скрипт запущен от root или с sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Этот скрипт требует прав root. Используйте: sudo $0"
    exit 1
fi

# Определение версии ОС
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo "❌ Не удалось определить операционную систему"
    exit 1
fi

echo "📦 Обнаружена ОС: $OS $VER"
echo ""

# Обновление системы
echo "🔄 Обновление списка пакетов..."
apt-get update -qq

echo "⬆️  Обновление установленных пакетов..."
apt-get upgrade -y -qq

# Установка базовых утилит
echo ""
echo "📦 Установка базовых утилит (git, curl, wget, ca-certificates)..."
apt-get install -y -qq \
    git \
    curl \
    wget \
    ca-certificates \
    gnupg \
    lsb-release \
    apt-transport-https \
    software-properties-common

# Удаление старых версий Docker (если есть)
echo ""
echo "🧹 Удаление старых версий Docker (если установлены)..."
apt-get remove -y -qq docker docker-engine docker.io containerd runc 2>/dev/null || true

# Установка Docker
echo ""
echo "🐳 Установка Docker..."

# Добавление официального GPG ключа Docker
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Настройка репозитория Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Обновление списка пакетов после добавления репозитория
apt-get update -qq

# Установка Docker Engine, Docker CLI, Containerd и Docker Compose Plugin
echo "📥 Установка Docker Engine, Docker CLI, Containerd и Docker Compose..."
apt-get install -y -qq \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

# Запуск и включение Docker
echo ""
echo "🚀 Запуск службы Docker..."
systemctl start docker
systemctl enable docker

# Проверка установки Docker
echo ""
echo "✅ Проверка установки Docker..."
if docker --version > /dev/null 2>&1; then
    DOCKER_VERSION=$(docker --version)
    echo "   ✓ Docker установлен: $DOCKER_VERSION"
else
    echo "   ❌ Ошибка: Docker не установлен"
    exit 1
fi

# Проверка установки Docker Compose
if docker compose version > /dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version)
    echo "   ✓ Docker Compose установлен: $COMPOSE_VERSION"
else
    echo "   ❌ Ошибка: Docker Compose не установлен"
    exit 1
fi

# Настройка прав для текущего пользователя (если не root)
if [ -n "$SUDO_USER" ]; then
    echo ""
    echo "👤 Настройка прав для пользователя $SUDO_USER..."
    usermod -aG docker $SUDO_USER
    echo "   ✓ Пользователь $SUDO_USER добавлен в группу docker"
    echo "   ⚠️  ВАЖНО: Выйдите и войдите снова, чтобы изменения вступили в силу"
fi

# Проверка работы Docker
echo ""
echo "🔍 Проверка работы Docker..."
if docker ps > /dev/null 2>&1; then
    echo "   ✓ Docker работает корректно"
else
    echo "   ⚠️  Предупреждение: Docker может требовать перезагрузки или перелогина"
fi

# Опциональная установка дополнительных утилит
echo ""
read -p "📦 Установить дополнительные утилиты? (htop, nano, ufw) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📥 Установка дополнительных утилит..."
    apt-get install -y -qq htop nano ufw
    echo "   ✓ Дополнительные утилиты установлены"
fi

# Итоговая информация
echo ""
echo "=========================================="
echo "✅ Установка завершена успешно!"
echo "=========================================="
echo ""
echo "📋 Следующие шаги:"
echo ""
echo "1. Если вы запускали скрипт через sudo, выйдите и войдите снова:"
echo "   exit"
echo "   # затем войдите снова"
echo ""
echo "2. Проверьте установку:"
echo "   docker --version"
echo "   docker compose version"
echo ""
echo "3. Протестируйте Docker:"
echo "   docker run hello-world"
echo ""
echo "4. Для развертывания приложения:"
echo "   git clone <your-repo>"
echo "   cd <project-directory>"
echo "   docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "=========================================="

