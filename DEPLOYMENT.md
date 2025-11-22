# Руководство по развертыванию на VPS сервере

Это пошаговое руководство поможет вам развернуть веб-сайт SOFI на VPS сервере с поддержкой HTTPS.

## Требования

- VPS сервер с Ubuntu 20.04+ или Debian 11+ (рекомендуется минимум 2GB RAM, 2 CPU)
- Доменное имя, настроенное на IP адрес сервера
- SSH доступ к серверу
- Базовые знания Linux команд

## Важно перед началом

Все данные для подключения к базе данных уже зашиты в `docker-compose.prod.yml`:
- Пользователь БД: `sofi`
- Пароль БД: `sofi_prod_2024_secure_pass`
- Имя БД: `sofi_db`

**Не нужно создавать .env файл для базы данных!** Данные уже настроены в docker-compose файле.

## Краткий план действий

1. ✅ **Подготовка сервера** - установка Docker, Docker Compose, Git
2. ✅ **Загрузка проекта** - копирование файлов на сервер
3. ✅ **Настройка DNS** - настройка A-записи для домена
4. ✅ **Получение SSL сертификата** - установка Certbot и получение сертификата
5. ✅ **Настройка конфигов** - замена `YOUR_DOMAIN` в nginx и docker-compose
6. ✅ **Запуск приложения** - запуск через docker-compose
7. ✅ **Настройка файрвола** - открытие портов 80, 443, 22
8. ✅ **Проверка работы** - проверка логов и доступности сайта

**Время выполнения:** ~30-60 минут

## Шаг 1: Подготовка сервера

### 1.1 Подключитесь к серверу

```bash
ssh root@your-server-ip
```

### 1.2 Обновите систему

```bash
apt update && apt upgrade -y
```

### 1.3 Установите Docker и Docker Compose

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
apt install docker-compose-plugin -y

# Проверка установки
docker --version
docker compose version
```

### 1.4 Установите Git

```bash
apt install git -y
```

## Шаг 2: Загрузка проекта на сервер

### 2.1 Создайте директорию для проекта

```bash
mkdir -p /var/www
cd /var/www
```

### 2.2 Загрузите проект на сервер

**Вариант 1: Через SCP (рекомендуется для первого раза)**

На вашем локальном компьютере выполните:

```bash
# Замените your-server-ip на IP адрес вашего сервера
scp -r /Users/apple/Desktop/my-app root@your-server-ip:/var/www/sofi-website
```

**Вариант 2: Через Git (если проект в репозитории)**

```bash
cd /var/www
git clone <your-repository-url> sofi-website
cd sofi-website
```

### 2.3 Перейдите в директорию проекта

```bash
cd /var/www/sofi-website
```

## Шаг 3: Настройка домена

### 3.1 Настройте DNS записи

В панели управления вашего домена добавьте A-запись:

```
Type: A
Name: @ (или www)
Value: ваш-ip-адрес-сервера
TTL: 3600
```

### 3.2 Проверьте DNS

```bash
# На вашем локальном компьютере
nslookup your-domain.com
```

## Шаг 4: Настройка SSL сертификатов (Let's Encrypt)

### 4.1 Установите Certbot

```bash
apt install certbot -y
```

### 4.2 Остановите nginx на сервере (если установлен)

```bash
systemctl stop nginx
systemctl disable nginx
```

**Важно:** Certbot должен использовать порт 80 для получения сертификата.

### 4.3 Получите SSL сертификат

**Замените `your-domain.com` на ваш реальный домен!**

```bash
certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

Следуйте инструкциям, введите email для уведомлений.

Сертификаты будут сохранены в:
- `/etc/letsencrypt/live/your-domain.com/fullchain.pem`
- `/etc/letsencrypt/live/your-domain.com/privkey.pem`

### 4.4 Настройте автообновление сертификатов

```bash
# Добавьте в crontab
crontab -e

# Добавьте строку (замените your-domain.com на ваш домен):
0 0 * * * certbot renew --quiet --deploy-hook "docker compose -f /var/www/sofi-website/docker-compose.prod.yml restart nginx"
```

## Шаг 5: Настройка конфигурационных файлов

### 5.1 Обновите nginx конфигурацию

Откройте файл `nginx/nginx.prod.conf` и замените `YOUR_DOMAIN` на ваш реальный домен:

```bash
cd /var/www/sofi-website
nano nginx/nginx.prod.conf
```

Найдите строки:
- `ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem;`
- `ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem;`

Замените `YOUR_DOMAIN` на ваш домен (например, `example.com`).

**Пример:**
```nginx
ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
```

Сохраните файл (Ctrl+O, Enter, Ctrl+X).

### 5.2 Обновите frontend конфигурацию

Откройте `docker-compose.prod.yml` и обновите `NEXT_PUBLIC_API_URL`:

```bash
nano docker-compose.prod.yml
```

Найдите строку:
```yaml
- NEXT_PUBLIC_API_URL=https://YOUR_DOMAIN/api
```

Замените `YOUR_DOMAIN` на ваш домен:
```yaml
- NEXT_PUBLIC_API_URL=https://example.com/api
```

Сохраните файл.

### 5.3 Проверьте docker-compose.prod.yml

Убедитесь, что файл `docker-compose.prod.yml` содержит зашитые данные для БД:
- `POSTGRES_USER: sofi`
- `POSTGRES_PASSWORD: sofi_prod_2024_secure_pass`
- `POSTGRES_DB: sofi_db`

**Данные уже настроены, ничего менять не нужно!**

### 5.4 (Опционально) Настройте Telegram уведомления

Если хотите получать уведомления в Telegram, создайте файл `.env`:

```bash
nano .env
```

Добавьте:
```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

Если не нужны уведомления, этот шаг можно пропустить.

## Шаг 6: Запуск приложения

### 6.1 Убедитесь, что вы в правильной директории

```bash
cd /var/www/sofi-website
```

### 6.2 Удалите старые volumes (если были предыдущие запуски)

**ВАЖНО:** Если вы запускали приложение ранее с другими настройками БД, нужно удалить старый volume:

```bash
# Остановите контейнеры (если запущены)
docker compose -f docker-compose.prod.yml down

# Удалите volume с базой данных
docker volume rm sofi-website_postgres_data
```

**Если это первый запуск, пропустите этот шаг!**

### 6.3 Запустите приложение

**Если у вас есть .env файл с Telegram токенами:**
```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

**Если .env файла нет (Telegram не настроен):**
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 6.4 Проверьте статус контейнеров

```bash
docker compose -f docker-compose.prod.yml ps
```

Все контейнеры должны быть в статусе `Up`:
- `sofi-db` - база данных
- `sofi-backend` - backend API
- `sofi-frontend` - frontend приложение
- `sofi-nginx` - nginx прокси

### 6.5 Проверьте логи

```bash
# Все сервисы
docker compose -f docker-compose.prod.yml logs -f

# Или конкретный сервис
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f db
```

**Ожидаемый результат:**
- База данных должна успешно запуститься и создать пользователя `sofi`
- Backend должен подключиться к базе данных (сообщение "Database connected successfully")
- Frontend должен собраться и запуститься
- Nginx должен запуститься без ошибок

**Если видите ошибки:**
- `Role "sofi" does not exist` - выполните шаг 6.2 (удаление volume)
- `cannot load certificate` - проверьте, что вы заменили `YOUR_DOMAIN` в nginx конфиге

## Шаг 7: Настройка файрвола

### 7.1 Настройте UFW (если используется)

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 7.2 Или настройте iptables

```bash
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j DROP
```

## Шаг 8: Автозапуск при перезагрузке сервера

Docker Compose автоматически перезапускает контейнеры благодаря `restart: unless-stopped`, но убедитесь, что Docker запускается при загрузке:

```bash
systemctl enable docker
```

## Шаг 9: Мониторинг и логи

### 9.1 Просмотр логов

```bash
# Все сервисы
docker compose -f docker-compose.prod.yml logs -f

# Конкретный сервис
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

### 9.2 Мониторинг ресурсов

```bash
docker stats
```

## Шаг 10: Обновление приложения

### 10.1 Обновление кода

```bash
cd /var/www/sofi-website

# Если используете Git
git pull origin main  # или ваша ветка

# Или загрузите новую версию через SCP
# scp -r /path/to/updated/project root@your-server-ip:/var/www/sofi-website

# Пересборка и перезапуск
docker compose -f docker-compose.prod.yml up -d --build

# Если есть .env файл
# docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

### 10.2 Обновление только одного сервиса

```bash
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

## Шаг 11: Резервное копирование

### 11.1 Резервное копирование базы данных

Создайте скрипт `backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/sofi"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker compose -f /var/www/sofi-website/docker-compose.prod.yml exec -T db pg_dump -U sofi sofi_db > $BACKUP_DIR/db_backup_$DATE.sql
# Удаляем старые бэкапы (старше 30 дней)
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +30 -delete
```

Добавьте в crontab:

```bash
crontab -e
# Ежедневный бэкап в 2:00
0 2 * * * /var/www/sofi-website/backup-db.sh
```

### 11.2 Резервное копирование загруженных файлов

```bash
tar -czf /var/backups/sofi/uploads_$(date +%Y%m%d).tar.gz /var/www/sofi-website/backend/uploads
```

## Полезные команды

### Остановка приложения

```bash
docker compose -f docker-compose.prod.yml down
```

### Перезапуск приложения

```bash
docker compose -f docker-compose.prod.yml restart
```

### Просмотр использования диска

```bash
docker system df
```

### Очистка неиспользуемых данных

```bash
docker system prune -a
```

## Решение проблем

### Проблема: Контейнеры не запускаются

```bash
# Проверьте логи
docker compose -f docker-compose.prod.yml logs

# Проверьте статус
docker compose -f docker-compose.prod.yml ps
```

### Проблема: SSL сертификат не работает (cannot load certificate)

**Причина:** В nginx конфиге не заменен `YOUR_DOMAIN` на реальный домен.

**Решение:**

1. Проверьте, что сертификат существует:
```bash
ls -la /etc/letsencrypt/live/
```

2. Откройте `nginx/nginx.prod.conf` и замените `YOUR_DOMAIN` на ваш домен:
```bash
cd /var/www/sofi-website
nano nginx/nginx.prod.conf
```

3. Перезапустите nginx:
```bash
docker compose -f docker-compose.prod.yml restart nginx
```

**Другие проверки:**
```bash
# Проверьте сертификаты
certbot certificates

# Обновите сертификат вручную (если нужно)
certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```

### Проблема: База данных не подключается (Role "sofi" does not exist)

**Причина:** База данных была создана с другими параметрами.

**Решение:**

```bash
cd /var/www/sofi-website

# Остановите контейнеры
docker compose -f docker-compose.prod.yml down

# Удалите volume с базой данных
docker volume rm sofi-website_postgres_data

# Запустите заново
docker compose -f docker-compose.prod.yml up -d --build
```

PostgreSQL создаст пользователя `sofi` автоматически при первом запуске.

**Проверка подключения:**
```bash
# Проверьте логи БД
docker compose -f docker-compose.prod.yml logs db

# Проверьте подключение
docker compose -f docker-compose.prod.yml exec db psql -U sofi -d sofi_db
```

## Рекомендации по безопасности

1. **Используйте сильные пароли** для базы данных
2. **Ограничьте SSH доступ** только с вашего IP
3. **Регулярно обновляйте** систему и Docker образы
4. **Настройте fail2ban** для защиты от брутфорса
5. **Используйте firewall** для ограничения доступа
6. **Регулярно делайте бэкапы** базы данных и файлов
7. **Мониторьте логи** на предмет подозрительной активности

## Поддержка

При возникновении проблем проверьте:
- Логи контейнеров: `docker compose logs`
- Статус сервисов: `docker compose ps`
- Доступность портов: `netstat -tulpn`
- DNS настройки: `nslookup your-domain.com`

