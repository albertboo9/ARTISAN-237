FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

# Rebuild on every change
FROM base AS rebuild-deps
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile

# Build web app
FROM rebuild-deps AS web-build
WORKDIR /app/apps/web
RUN pnpm run build

# Build API server
FROM rebuild-deps AS api-build
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm run build

# Production web stage
FROM node:20-alpine AS web-production
WORKDIR /app
COPY --from=web-build /app/apps/web/.next ./.next
COPY --from=web-build /app/apps/web/public ./public
COPY --from=web-build /app/apps/web/package.json ./package.json
COPY --from=web-build /app/apps/web/next.config.js ./
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npx", "next", "start"]

# Production API stage
FROM node:20-alpine AS api-production
WORKDIR /app
COPY --from=api-build /app/apps/api/dist ./dist
COPY --from=api-build /app/apps/api/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=api-build /app/apps/api/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/src/main.js"]