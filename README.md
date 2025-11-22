# SOFI - Веб-сайт премиальной мебели для отелей

Полнофункциональный веб-сайт с русифицированным frontend на Next.js и backend на Golang.

## Развертывание на хостинге

Подробное руководство по развертыванию на хостинге с поддержкой HTTPS см. в файле [DEPLOYMENT.md](./DEPLOYMENT.md).

## Структура проекта

- `app/` - Next.js frontend приложение
- `components/` - React компоненты
- `backend/` - Golang backend API
- `nginx/` - Nginx конфигурация для HTTPS
- `docker-compose.yml` - Конфигурация Docker Compose

## База данных

Проект использует PostgreSQL для хранения данных. Данные сохраняются в Docker volume `postgres_data`, поэтому они не теряются при перезапуске контейнеров.

**Параметры подключения:**
- Host: `db` (внутри Docker) или `localhost` (локально)
- Port: `5432`
- User: `luxe`
- Password: `luxe123`
- Database: `luxe_db`

## Запуск с Docker

### Требования
- Docker
- Docker Compose

### Запуск всего стека

```bash
docker-compose up --build
```

После запуска:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

**Примечание:** Для локальной разработки используется HTTP. HTTPS настроен только для production (см. [DEPLOYMENT.md](./DEPLOYMENT.md)).

**Важно:** При первом запуске база данных автоматически инициализируется с дефолтными данными (если таблицы пустые). При последующих запусках данные сохраняются благодаря Docker volume.

### Остановка

```bash
docker-compose down
```

## API Endpoints

### Публичные endpoints

- `GET /api/products` - Получить все продукты
- `GET /api/products/{id}` - Получить продукт по ID
- `GET /api/categories` - Получить все категории
- `GET /api/collections` - Получить все коллекции
- `GET /api/collections/{id}` - Получить коллекцию по ID
- `GET /api/health` - Проверка здоровья сервиса

### Админ endpoints (CRUD операции)

**Товары:**
- `POST /api/admin/products` - Создать товар
- `PUT /api/admin/products/{id}` - Обновить товар
- `DELETE /api/admin/products/{id}` - Удалить товар

**Категории:**
- `POST /api/admin/categories` - Создать категорию
- `PUT /api/admin/categories/{id}` - Обновить категорию
- `DELETE /api/admin/categories/{id}` - Удалить категорию

**Коллекции:**
- `POST /api/admin/collections` - Создать коллекцию
- `PUT /api/admin/collections/{id}` - Обновить коллекцию
- `DELETE /api/admin/collections/{id}` - Удалить коллекцию

**Загрузка файлов:**
- `POST /api/admin/upload` - Загрузить изображение (multipart/form-data, поле "image")

**База данных:**
- `POST /api/admin/db/dump` - Создать дамп базы данных
- `POST /api/admin/db/restore` - Восстановить базу данных из дампа (multipart/form-data, поле "dump")

## Админ панель

Админ панель доступна по адресу: http://localhost:3000/admin

Функционал:
- Управление товарами (создание, редактирование, удаление)
- Управление категориями (создание, редактирование, удаление)
- Управление коллекциями (создание, редактирование, удаление)
- Просмотр статистики
- **Загрузка изображений** - возможность загружать файлы изображений вместо ввода URL
- **Управление базой данных** - создание дампов и восстановление из дампов

### Загрузка изображений

В админ панели реализована загрузка изображений для товаров и коллекций:
- Поддерживаемые форматы: все форматы изображений
- Максимальный размер файла: 5MB
- Загруженные файлы сохраняются в папке `backend/uploads/`
- Файлы доступны по адресу: `http://localhost:8080/uploads/{filename}`

Доступ к админ панели можно получить через ссылку "Админ" в навигации сайта.

## Разработка

### Frontend (без Docker)

```bash
cd /Users/apple/Desktop/my-app
npm install
npm run dev
```

### Backend (без Docker)

```bash
cd /Users/apple/Desktop/my-app/backend
go mod download
go run main.go
```

## Технологии

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Golang, Gorilla Mux, CORS
- **Database**: PostgreSQL 15
- **Docker**: Multi-stage builds для оптимизации

## Персистентность данных

Все данные (товары, категории, коллекции) сохраняются в PostgreSQL. Docker volume `postgres_data` обеспечивает сохранность данных при перезапуске контейнеров. Данные не теряются при:
- Перезапуске `docker-compose restart`
- Остановке и запуске `docker-compose down && docker-compose up`
- Обновлении образов

Для полного удаления данных (включая БД) используйте:
```bash
docker-compose down -v
```

## Управление дампами базы данных

В админ-панели доступен функционал создания дампов базы данных и восстановления из дампов.

### Создание дампа

1. Перейдите в раздел "База данных" в админ-панели
2. Нажмите "Создать дамп"
3. Дамп будет создан в формате PostgreSQL (custom format)
4. Если настроен Telegram бот, дамп автоматически отправится в Telegram

### Восстановление из дампа

1. Перейдите в раздел "База данных" в админ-панели
2. Выберите файл дампа (.sql или .dump)
3. Нажмите "Восстановить базу данных"
4. **ВНИМАНИЕ:** Все текущие данные будут заменены данными из дампа

### Настройка Telegram бота (опционально)

Для автоматической отправки дампов в Telegram:

1. Создайте бота через [@BotFather](https://t.me/botfather) в Telegram
2. Получите токен бота
3. Узнайте ваш Chat ID (можно использовать [@userinfobot](https://t.me/userinfobot))
4. Добавьте переменные окружения в `docker-compose.yml` или создайте `.env` файл:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

Или добавьте в `docker-compose.yml`:

```yaml
environment:
  - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN:-}
  - TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID:-}
```

После настройки все созданные дампы будут автоматически отправляться в указанный Telegram чат.
