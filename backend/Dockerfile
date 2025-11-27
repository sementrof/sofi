# ----------------------------
# Builder stage
# ----------------------------
    FROM golang:1.21-alpine AS builder

    # Используем быстрый репозиторий
    RUN sed -i 's|dl-cdn.alpinelinux.org|mirror.leaseweb.com/alpine|g' /etc/apk/repositories \
        && apk update \
        && apk add --no-cache gcc musl-dev git
    
    WORKDIR /app
    
    # Копируем зависимости и скачиваем их
    COPY go.mod go.sum ./
    RUN go mod download
    
    # Копируем код и собираем
    COPY . .
    RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main .
    
    # ----------------------------
    # Runtime stage
    # ----------------------------
    FROM alpine:3.19
    
    # Быстрый репозиторий и нужные пакеты
    RUN sed -i 's|dl-cdn.alpinelinux.org|mirror.leaseweb.com/alpine|g' /etc/apk/repositories \
        && apk update \
        && apk add --no-cache ca-certificates postgresql15-client curl
    
    WORKDIR /root/
    
    # Копируем бинарь из builder
    COPY --from=builder /app/main .
    
    # Создаем папки для загрузок и дампов
    RUN mkdir -p uploads dumps
    
    EXPOSE 8080
    
    CMD ["./main"]
    