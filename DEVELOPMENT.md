# Artisan237 — Development Environment Quick Start

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/)
- [Docker & Docker Compose](https://docs.docker.com/) (for database, Redis, ML service)
- [Python 3.12+](https://python.org/) (for ML service)

## 1. Clone & Install

```bash
git clone <repo-url>
cd artisan237
pnpm install
```

## 2. Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

## 3. Start Infrastructure (Docker)

```bash
# Start DB + Redis + MinIO in background
docker compose up -d db redis minio

# Verify health
docker compose ps
```

## 4. Database Migration & Seeding

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed with demo data
pnpm db:seed
```

## 5. Run Services

```bash
# Start everything (web + api + ml)
pnpm dev

# Or individually:
pnpm dev:web    # http://localhost:3000
pnpm dev:api    # http://localhost:3001  (Swagger: /api/docs)
pnpm dev:ml     # http://localhost:8000  (/api/v1/health)
```

## 6. Verify

| Service   | URL                                |
|-----------|------------------------------------|
| Web App   | http://localhost:3000              |
| API       | http://localhost:3001/api/v1       |
| Swagger   | http://localhost:3001/api/docs     |
| ML Health | http://localhost:8000/api/v1/health|

## 7. Run Tests

```bash
# All tests
pnpm test

# Web tests only
pnpm test:web

# API tests only
pnpm test:api

# With coverage
pnpm test -- --coverage
```

## 8. Lint & Format

```bash
pnpm lint
pnpm format
```

## 9. Build for Production

```bash
pnpm build
```

## 10. Docker Production

```bash
docker compose up -d --build
```

## Troubleshooting

| Problem                    | Solution                                  |
|----------------------------|-------------------------------------------|
| Port 3000 in use          | Kill process or change PORT in .env       |
| DB connection refused     | `docker compose up -d db` first           |
| Prisma errors             | Run `pnpm db:generate` then `pnpm db:migrate` |
| ML model not found        | Run training: `cd ml-service && python train.py` |
| EADDRINUSE                | Check `lsof -i :PORT` and kill conflicts  |

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│  NestJS API  │────▶│   MariaDB   │
│   (Frontend)│◀────│  :3001       │     │   (Primary)  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐     ┌─────────────┐
                    │   Redis      │     │   FastAPI    │
                    │  (Cache)     │◀───▶│ ML Service   │
                    └──────────────┘     │  :8000       │
                                         └─────────────┘
```

## Monorepo Structure

```
apps/web         → Next.js 15 frontend (React 18, TailwindCSS, shadcn/ui)
apps/api         → NestJS backend (Prisma ORM, MariaDB, JWT auth)
apps/ml-service  → FastAPI ML recommendation engine
apps/admin       → Admin dashboard (Next.js)
packages/ui      → Shared shadcn/ui components
packages/types   → Shared TypeScript types
packages/config  → Shared config validation (Zod)
packages/shared  → Shared utilities
```