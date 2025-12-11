# Используем чистый образ Go для сборки
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache gcc musl-dev

# Загрузка модулей Go
COPY go.mod go.sum ./
RUN go mod download

# Копирование исходного кода
COPY . .

# Важно: отключаем CGO для статической сборки
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# -----------------------------
# Финальный образ для запуска
# -----------------------------
FROM alpine:3.20

RUN apk --no-cache add ca-certificates curl postgresql-client
WORKDIR /root/

# Копируем статический бинарник из стадии сборки
COPY --from=builder /app/main .

# Создаем необходимые директории
RUN mkdir -p uploads dumps

EXPOSE 8080
CMD ["./main"]