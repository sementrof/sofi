FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main .

FROM alpine:latest

RUN apk --no-cache add ca-certificates postgresql15-client curl

WORKDIR /root/

COPY --from=builder /app/main .
RUN mkdir -p uploads dumps

EXPOSE 8080

CMD ["./main"]

