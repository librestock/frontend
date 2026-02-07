# Dockerfile for @librestock/web (TanStack Start)

# Base stage with pnpm
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# Development stage - for local dev with HMR
FROM base AS development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# Build stage
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production stage
FROM node:24-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 tanstack

COPY --from=builder --chown=tanstack:nodejs /app/.output ./.output

USER tanstack
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
