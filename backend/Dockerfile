FROM golang:1.21-alpine3.19 AS builder

# Фикс репозиториев (иначе apk висит)
RUN sed -i 's/dl-cdn.alpinelinux.org/alpine.global.ssl.fastly.net/g' /etc/apk/repositories

WORKDIR /app

RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main .

# Runtime
FROM alpine:3.19

RUN sed -i 's/dl-cdn.alpinelinux.org/alpine.global.ssl.fastly.net/g' /etc/apk/repositories

RUN apk add --no-cache ca-certificates postgresql15-client curl

WORKDIR /root
COPY --from=builder /app/main .

RUN mkdir -p uploads dumps

EXPOSE 8080
CMD ["./main"]
