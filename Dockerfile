# Dockerfile for @librestock/web (TanStack Start)
# Based on: https://github.com/olegkorol/docker-tanstack-start

# Base stage with pnpm
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# Development stage - for local dev with HMR
FROM base AS development
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/tsconfig/ ./packages/tsconfig/
COPY packages/eslint-config/ ./packages/eslint-config/
COPY packages/types/package.json ./packages/types/
COPY packages/types/tsconfig.build.json packages/types/tsconfig.build.cjs.json ./packages/types/
COPY packages/types/scripts/ ./packages/types/scripts/
COPY packages/types/src/ ./packages/types/src/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile
COPY frontend/ ./frontend/
WORKDIR /app/frontend
EXPOSE 3000
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# Build stage
FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/tsconfig/ ./packages/tsconfig/
COPY packages/eslint-config/ ./packages/eslint-config/
COPY packages/types/package.json ./packages/types/
COPY packages/types/tsconfig.build.json packages/types/tsconfig.build.cjs.json ./packages/types/
COPY packages/types/scripts/ ./packages/types/scripts/
COPY packages/types/src/ ./packages/types/src/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile
COPY frontend/ ./frontend/
RUN pnpm --filter @librestock/web build

# Production stage
FROM node:24-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 tanstack

COPY --from=builder --chown=tanstack:nodejs /app/frontend/.output ./.output

USER tanstack
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
