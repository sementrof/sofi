# ----------------------------
# Base image
# ----------------------------
    FROM node:20-alpine AS base

    # ----------------------------
    # Dependencies stage
    # ----------------------------
    FROM base AS deps
    
    # Быстрый репозиторий и необходимые библиотеки
    RUN sed -i 's|dl-cdn.alpinelinux.org|mirror.leaseweb.com/alpine|g' /etc/apk/repositories \
        && apk update \
        && apk add --no-cache libc6-compat
    
    WORKDIR /app
    
    COPY package.json package-lock.json* ./
    RUN npm install --legacy-peer-deps
    
    # ----------------------------
    # Builder stage
    # ----------------------------
    FROM base AS builder
    WORKDIR /app
    
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    # Отключаем телеметрию Next.js
    ENV NEXT_TELEMETRY_DISABLED 1
    
    RUN npm run build
    
    # ----------------------------
    # Production stage
    # ----------------------------
    FROM base AS runner
    WORKDIR /app
    
    ENV NODE_ENV production
    ENV NEXT_TELEMETRY_DISABLED 1
    
    # Создаем пользователя
    RUN addgroup --system --gid 1001 nodejs \
        && adduser --system --uid 1001 nextjs
    
    COPY --from=builder /app/public ./public
    
    # Папка для кэша
    RUN mkdir .next \
        && chown nextjs:nodejs .next
    
    # Копируем сборку Next.js
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    
    USER nextjs
    
    EXPOSE 3000
    ENV PORT 3000
    ENV HOSTNAME "0.0.0.0"
    
    CMD ["node", "server.js"]
    