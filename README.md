# Artisan237

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-E0232E?style=for-the-badge&logo=nestjs)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)

Artisan237 is an AI-powered marketplace connecting clients with verified artisans in Douala, Cameroon. The platform features geolocation-based search, a reputation system, XP gamification, and a hybrid ML recommendation engine.

## Features

- 🔐 **Secure Authentication** — JWT with refresh token rotation, RBAC, rate limiting
- 📍 **Smart Geolocation** — GPS-based artisan discovery with Leaflet maps
- 🤖 **AI Recommendations** — Hybrid ML engine for personalized artisan matching
- 🎮 **Gamification** — XP system, badges, levels, and leaderboards
- ⭐ **Reputation System** — Weighted ratings with anti-fraud measures
- 📱 **Responsive Design** — Mobile-first with dark/light mode support
- 🚀 **Production Ready** — Docker, CI/CD, monitoring, and comprehensive testing

## Architecture

```
apps/
├── web/              # Next.js 15 frontend
├── api/              # NestJS backend API
├── ml-service/       # FastAPI ML recommendation engine
└── admin/            # Admin dashboard

packages/
├── ui/               # Shared shadcn/ui components
├── types/            # Shared TypeScript types
├── config/           # Shared configs
├── shared/           # Shared utilities
└── eslint-config/    # Shared ESLint config
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/artisan237/artisan237.git
cd artisan237

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start infrastructure (requires Docker)
pnpm db:start

# Run database migrations
pnpm db:migrate

# Seed database with test data
pnpm db:seed

# Start all applications in development
pnpm dev
```

## Environment Variables

See `.env.example` for all required environment variables.

## API Documentation

Once the API is running, access Swagger documentation at:

```
http://localhost:3001/api/docs
```

## Development

```bash
# Run web app only
pnpm dev:web

# Run API only
pnpm dev:api

# Run ML service only
pnpm dev:ml

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

## Testing Strategy

| Layer       | Tool          | Coverage |
|-------------|---------------|----------|
| Unit        | Jest / Vitest | 80%      |
| Integration | Supertest     | Critical paths |
| E2E         | Playwright    | Core flows |
| API Contract| Postman       | Full API surface |

## Docker Deployment

```bash
# Production
docker compose up -d --build

# Development with hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## Tech Stack

| Layer        | Technology                      |
|-------------|--------------------------------|
| Frontend    | Next.js 15, React 19, TypeScript |
| UI          | shadcn/ui, TailwindCSS         |
| State       | Zustand, TanStack Query        |
| Backend     | NestJS 10, Prisma ORM          |
| Database    | MariaDB 11                     |
| ML Service  | FastAPI, Scikit-learn          |
| Auth        | JWT, bcrypt, Refresh Tokens    |
| Infrastructure | Docker, GitHub Actions      |
| Testing     | Jest, Supertest, Playwright    |

## Project Structure - Frontend

```
app/
├── (auth)/           # Authentication pages
├── (dashboard)/      # User dashboard
├── (marketplace)/    # Artisan discovery
├── (admin)/          # Admin panel
├── providers.tsx     # App providers
└── layout.tsx        # Root layout
```

## Project Structure - Backend

```
src/modules/
├── auth/             # Authentication module
├── artisans/         # Artisan profile management
├── marketplace/      # Search and discovery
├── missions/         # Job lifecycle management
├── reviews/          # Rating and reviews
├── gamification/     # XP, badges, levels
├── notifications/    # Notification system
└── search/           # ML-powered search
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Ensure tests pass and linting is clean
4. Commit with conventional commits (`feat(scope): description`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.