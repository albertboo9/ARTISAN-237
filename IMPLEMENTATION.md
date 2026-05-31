# Artisan237 — Complete Implementation

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-E0232E?style=for-the-badge&logo=nestjs)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)

## Architecture

```
artisan237/
├── apps/
│   ├── web/              ← Next.js 15 (App Router, React 18, shadcn/ui, TailwindCSS)
│   ├── api/              ← NestJS 10 (Prisma ORM, MariaDB, JWT, RBAC)
│   ├── ml-service/       ← FastAPI (Scikit-learn, hybrid recommendation engine)
│   └── admin/            ← Admin dashboard (Next.js)
├── packages/
│   ├── ui/               ← Shared shadcn/ui component primitives
│   ├── types/            ← Shared TypeScript types & interfaces
│   ├── config/           ← Shared config validation (Zod)
│   ├── shared/           ← Shared utilities (formatters, geo, XP calc)
│   └── eslint-config/    ← Shared ESLint rules
├── docker/
│   ├── db/init/          ← SQL initialization scripts
│   └── html/             ← Maintenance page
├── .github/workflows/    ← CI/CD pipelines
├── .husky/               ← Git hooks (lint-staged)
├── .vscode/              ← Editor settings & extensions
└── turbo.json            ← Turborepo build orchestration
```

## Module Matrix

| Module          | Files | Features                              |
|-----------------|-------|---------------------------------------|
| Auth            | 8     | JWT, refresh rotation, bcrypt, RBAC   |
| Users           | 4     | CRUD, pagination, soft delete         |
| Artisans        | 6     | Profile CRUD, search, leaderboard     |
| Marketplace     | 6     | Search, filters, recommendations      |
| Missions        | 6     | Full lifecycle (create→complete)      |
| Reviews         | 4     | Ratings, moderation, helpful votes    |
| Gamification    | 4     | XP system, badges, levels, leaderboard|
| Notifications   | 4     | CRUD, read/unread management          |
| Search          | 4     | Full-text, autocomplete, categories   |
| Admin           | 4     | Dashboard, user management, analytics |
| ML Service      | 5     | Hybrid recommender, <300ms target     |

## Security Layers

1. **Network**: CORS, rate limiting, IP blocking
2. **Application**: Helmet, CSRF, input validation, XSS prevention
3. **Auth**: bcrypt-12, JWT with RS256, token rotation, cookie security
4. **Audit**: All sensitive operations logged

## Quick Start

```bash
git clone <repo-url> && cd artisan237
cp .env.example .env.local        # Configure credentials
pnpm install                       # Install all dependencies
docker compose up -d db redis      # Start infrastructure
pnpm db:generate && pnpm db:migrate # Database setup
pnpm db:seed                       # Load demo data
pnpm dev                           # Launch all services
```

## Stack

| Layer  | Technology                          |
|--------|-------------------------------------|
| Frontend | Next.js 15, React 18, TypeScript |
| UI     | shadcn/ui, TailwindCSS, Radix UI   |
| State  | Zustand, TanStack Query, React Hook Form, Zod |
| Backend | NestJS 10, Prisma ORM, MariaDB    |
| Auth   | JWT, Passport, bcrypt, refresh tokens |
| ML     | FastAPI, Scikit-learn, joblib      |
| Infra  | Docker, GitHub Actions, pnpm, Turborepo |
| Testing | Jest, Supertest, Playwright, Vitest |