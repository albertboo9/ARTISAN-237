# 🚀 Artisan237 — Monorepo Structure

```
artisan237/
│
├── .github/
│   └── workflows/
│       └── ci.yml                          # CI pipeline (lint, test, build, deploy)
│
├── .husky/
│   └── pre-commit                          # Git hook: runs lint-staged
│
├── .vscode/
│   ├── extensions.json                     # Recommended extensions
│   └── settings.json                       # Format on save, default formatter
│
├── apps/
│   │
│   ├── api/                                # 🔵 NestJS Backend
│   │   ├── src/
│   │   │   ├── app.module.ts               # Root module registration
│   │   │   ├── main.ts                     # Bootstrap, Swagger, global config
│   │   │   ├── common/                     # Shared infrastructure
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts   # JWT authentication guard
│   │   │   │   │   └── roles.guard.ts      # RBAC authorization guard
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── timeout.interceptor.ts
│   │   │   │   │   └── transform.interceptor.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── all-exceptions.filter.ts
│   │   │   │   ├── pipes/
│   │   │   │   └── decorators/
│   │   │   │       └── is-public.decorator.ts
│   │   │   ├── modules/                    # Feature modules (10 modules)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── dto/auth.dto.ts
│   │   │   │   │   └── guards/
│   │   │   │   ├── users/
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   └── users.service.ts
│   │   │   │   ├── artisans/
│   │   │   │   │   ├── artisans.controller.ts
│   │   │   │   │   └── artisans.service.ts
│   │   │   │   ├── marketplace/
│   │   │   │   │   ├── marketplace.controller.ts
│   │   │   │   │   └── marketplace.service.ts
│   │   │   │   ├── missions/
│   │   │   │   │   ├── missions.controller.ts
│   │   │   │   │   └── missions.service.ts
│   │   │   │   ├── reviews/
│   │   │   │   │   ├── reviews.controller.ts
│   │   │   │   │   └── reviews.service.ts
│   │   │   │   ├── gamification/
│   │   │   │   │   ├── gamification.controller.ts
│   │   │   │   │   └── gamification.service.ts
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── notifications.controller.ts
│   │   │   │   │   └── notifications.service.ts
│   │   │   │   ├── search/
│   │   │   │   │   ├── search.controller.ts
│   │   │   │   │   └── search.service.ts
│   │   │   │   └── admin/
│   │   │   │       ├── admin.controller.ts
│   │   │   │       └── admin.service.ts
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma            # Full database schema
│   │   │   │   ├── prisma.module.ts
│   │   │   │   ├── prisma.service.ts
│   │   │   │   └── seeders/
│   │   │   │       └── main.seed.ts         # Demo data seeder
│   │   │   └── shared/
│   │   │       └── shared.service.ts
│   │   ├── test/
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── global-setup.ts
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── web/                                # 🟢 Next.js Frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx           # Login form
│   │   │   │   └── register/page.tsx        # Registration form
│   │   │   ├── (marketplace)/
│   │   │   │   └── page.tsx                 # Artisan discovery page
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx               # Protected layout
│   │   │   │   └── page.tsx                 # Dashboard home
│   │   │   ├── (admin)/
│   │   │   │   └── page.tsx                 # Admin panel
│   │   │   ├── providers.tsx                # QueryClient, Theme, Auth
│   │   │   ├── layout.tsx                   # Root layout with metadata
│   │   │   └── document.tsx                 # HTML document
│   │   ├── components/
│   │   │   ├── Navigation.tsx               # Responsive navbar
│   │   │   ├── AuthForm.tsx                 # Login/Register form
│   │   │   ├── app-layout.tsx               # App shell layout
│   │   │   ├── footer.tsx                   # Site footer
│   │   │   ├── protected-route.tsx          # Client-side auth guard
│   │   │   ├── index.ts                     # Re-exports
│   │   │   └── ui/
│   │   │       ├── button.tsx, input.tsx, label.tsx
│   │   │       ├── card.tsx, tabs.tsx, select.tsx
│   │   │       ├── sheet.tsx, tooltip.tsx, avatar.tsx
│   │   │       ├── separator.tsx, use-toast.tsx
│   │   │       ├── skeleton.tsx, card-skeleton.tsx
│   │   │       ├── badge.tsx, empty-state.tsx
│   │   │       ├── container.tsx, loading-spinner.tsx
│   │   ├── hooks/
│   │   │   └── api-hooks.ts                 # React Query hooks
│   │   ├── stores/
│   │   │   ├── auth.store.ts                # Auth state (Zustand)
│   │   │   └── api.store.ts                 # API + UI stores
│   │   ├── lib/
│   │   │   └── server-api.ts                # Server-side API fetcher
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   ├── ml-service/                          # 🟡 FastAPI ML Engine
│   │   ├── app/
│   │   │   ├── main.py                      # FastAPI app + lifespan
│   │   │   ├── api/
│   │   │   │   └── v1/
│   │   │   │       └── recommendations.py   # REST endpoints
│   │   │   ├── core/
│   │   │   │   ├── config.py                # Pydantic settings
│   │   │   │   ├── enums.py                 # Category enum
│   │   │   │   ├── exceptions.py            # App exceptions
│   │   │   │   └── middleware.py            # Request logging, metrics
│   │   │   ├── services/
│   │   │   │   └── recommender.py           # Hybrid ranking engine
│   │   │   ├── schemas/
│   │   │   └── ml/
│   │   │       ├── train.py                 # Model training script
│   │   │       └── model.joblib             # Serialized model
│   │   ├── tests/
│   │   │   └── test_recommendations.py      # API + latency tests
│   │   ├── requirements.txt
│   │   ├── pyproject.toml
│   │   ├── pytest.ini
│   │   ├── Dockerfile
│   │   └── tsconfig.json
│   │
│   └── admin/                               # 🔴 Admin Dashboard
│       └── (same as web, separate Next.js app)
│
├── packages/
│   ├── ui/                                  # Shared component primitives
│   │   ├── src/
│   │   │   ├── components/ui/               # Button, Input, Card, Tabs...
│   │   │   ├── lib/                         # cn(), formatters, IDs
│   │   │   └── index.ts
│   │   └── package.json, tsconfig.json
│   │
│   ├── types/                               # Shared TypeScript interfaces
│   │   ├── src/index.ts                     # Domain types, enums, DTOs
│   │   └── package.json, tsconfig.json
│   │
│   ├── config/                              # Shared Zod config schemas
│   │   ├── src/index.ts
│   │   └── package.json, tsconfig.json
│   │
│   ├── shared/                              # Shared utilities
│   │   ├── src/index.ts                     # Geo, formatters, XP calc
│   │   └── package.json, tsconfig.json
│   │
│   └── eslint-config/
│       ├── index.js                         # Enterprise ESLint rules
│       └── package.json
│
├── docker/
│   ├── db/init/
│   │   ├── 01-create-database.sql
│   │   ├── 02-create-indexes.sql
│   │   ├── 03-add-columns.sql
│   │   └── 04-procedures.sql
│   ├── html/
│   │   └── maintenance.html
│   └── api/                                # API Dockerfile
│   └── web/                                # Web Dockerfile
│
├── .github/workflows/ci.yml                # GitHub Actions CI/CD
├── turbo.json                              # Turborepo pipeline
├── pnpm-workspace.yaml                     # Monorepo workspace config
├── package.json                            # Root workspace config
├── .env.example                            # Environment template
├── .gitignore                              # Git ignore rules
├── .eslintrc.js                            # Root ESLint config
├── docker-compose.yml                      # Production Docker Compose
├── docker-compose.dev.yml                  # Development overrides
├── README.md                               # Project documentation
├── DEVELOPMENT.md                          # Dev quick-start guide
├── IMPLEMENTATION.md                       # Implementation summary
├── CODESTYLE.md                            # Coding conventions
└── .project-config.yaml                    # Project config
```

## How to Use This Structure

1. **Start development**: `pnpm dev` (uses Turborepo to run all apps)
2. **Start individual services**:
   - `pnpm dev:web` — Next.js frontend on http://localhost:3000
   - `pnpm dev:api` — NestJS API on http://localhost:3001 (Swagger at /api/docs)
   - `pnpm dev:ml` — FastAPI ML service on http://localhost:8000
3. **Database**: `pnpm db:migrate`, `pnpm db:seed`
4. **Testing**: `pnpm test`
5. **Build**: `pnpm build`
6. **Docker**: `docker compose up -d --build`

## Module Details

### Auth Module
- JWT access tokens (15 min) + refresh tokens (7 days)
- Token rotation with reuse detection
- bcrypt-12 password hashing
- Rate limiting on login
- Email verification flow
- Roles: USER, ARTISAN, ADMIN

### Artisan Module
- Profile CRUD with validation
- Portfolio uploads
- Skills & availability management
- Level system (XP thresholds)
- Leaderboard query

### Marketplace Module
- Geo-filtered search (Haversine)
- Multi-criteria sorting (rating, distance, price, XP)
- AI-powered recommendations (via ML service)
- Category filtering, online status filter

### Missions Module
- Full lifecycle: CREATE → ACCEPT → START → COMPLETE → REVIEW
- Price negotiation
- Role-based authorization (client vs artisan)
- XP rewards on completion

### Reviews Module
- Authenticated reviews only
- Verified purchase tracking
- Helpful voting system
- Anti-spam moderation

### Gamification Module
- XP log tracking per action
- 10-level progression (quadratic XP curve)
- Badge system (Common, Rare, Epic, Legendary)
- Global leaderboard

### ML Service — Recommendation Engine
- Hybrid scoring: geo(0.25) + rating(0.25) + xp(0.20) + category(0.15) + history(0.10) + availability(0.05)
- Cosine similarity + KNN fallback
- <300ms response target
- Graceful fallback to basic search if ML unavailable