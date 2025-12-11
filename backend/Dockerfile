# -----------------------------
# 1. Builder stage (Go build)
# -----------------------------
FROM --platform=$BUILDPLATFORM golang:1.21-alpine AS builder

# Automatically provided by Docker BuildKit during cross-compilation:
#   TARGETOS=linux
#   TARGETARCH=amd64 (or arm64 if explicitly requested)
ARG TARGETOS
ARG TARGETARCH

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build Go binary for the TARGET platform (not host Mac)
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o main .


# -----------------------------
# 2. Final runtime stage
# -----------------------------
FROM alpine:3.20

# Stable PostgreSQL client package
RUN apk --no-cache add ca-certificates curl postgresql-client

WORKDIR /root/

# Copy the compiled binary
COPY --from=builder /app/main .

# App directories
RUN mkdir -p uploads dumps

EXPOSE 8080

CMD ["./main"]
