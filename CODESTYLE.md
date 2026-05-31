# Artisan237 Contribution Guide

## Code Style

### TypeScript
- Use strict mode (`strict: true` in tsconfig)
- Prefer functional patterns over class-based when possible
- Use discriminated unions instead of enums for API boundaries
- Use branded types for IDs (e.g., `UserId`, `ArtisanId`)
- Use `satisfies` operator for type narrowing
- Prefer `ReadonlyArray` over `readonly` on individual items

### Naming Conventions
- Files: `kebab-case.ts` (e.g., `user-profile.service.ts`)
- Classes: `PascalCase` (e.g., `ArtisanProfileService`)
- Interfaces: `PascalCase` with `I` prefix optional (e.g., `User`, `IUserService`)
- Types: `PascalCase` (e.g., `RegisterDto`)
- Variables: `camelCase` (e.g., `artisanProfile`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- Enums: `PascalCase` (e.g., `UserRole`)
- Methods: `camelCase` (e.g., `getArtisanById()`)

### Import Order
1. React / Next.js imports
2. External library imports
3. Workspace package imports (@artisan237/*)
4. Relative imports (same module)
5. Relative imports (other modules)

### File Structure
```
feature/
├── feature.controller.ts     # Route handlers
├── feature.service.ts        # Business logic
├── feature.module.ts         # Module definition
├── dto/
│   └── feature.dto.ts        # Data transfer objects
├── interfaces/
│   └── feature.interface.ts  # Type interfaces
├── guards/
│   └── feature.guard.ts      # Custom guards
└── __tests__/
    └── feature.service.spec.ts
```

### Error Handling
- Use typed errors with specific error codes
- Never throw generic `Error`
- Use the `AllExceptionsFilter` for consistent error responses
- Log errors with context (request ID, user ID, etc.)

### API Design
- Use RESTful resource naming (`/artisans`, `/missions/:id`)
- Version all endpoints (`/api/v1/...`)
- Use DTOs for all request/response bodies
- Validate all inputs with class-validator
- Paginate all list endpoints
- Use consistent response format:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { ... }
  }
  ```

## Git Workflow

### Branch Naming
- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `chore/description` - Maintenance tasks
- `hotfix/description` - Critical production fixes
- `test/description` - Test additions

### PR Guidelines
1. Title: `[type(scope)]: description`
   - Example: `[feat(marketplace)]: add artisan search with filters`
2. Description: Explain what, why, and how
3. Checklist:
   - [ ] All tests pass
   - [ ] Linting passes
   - [ ] Type checking passes
   - [ ] No secrets in code
   - [ ] Error handling implemented
   - [ ] Documentation updated
4. Require at least 1 approval
5. Pass CI before merge

### Commit Messages
```
feat(module): add description

- Detail 1
- Detail 2

Closes #123
```

## Security Rules
1. **NEVER** commit `.env` files
2. **NEVER** log secrets or tokens
3. **ALWAYS** validate and sanitize user input
4. **ALWAYS** use parameterized queries (Prisma handles this)
5. **ALWAYS** hash passwords with bcrypt (never store plaintext)
6. **ALWAYS** use HTTPS in production
7. **ALWAYS** set proper CORS origins
8. **NEVER** expose internal error details to clients
9. **ALWAYS** rate-limit authentication endpoints
10. **ALWAYS** implement proper authorization checks

## Testing Standards
- Unit tests: Test individual functions/services in isolation
- Integration tests: Test module interactions with test database
- E2E tests: Test full request/response cycles
- Minimum 80% code coverage for new modules
- Test all error paths, not just happy paths
- Use meaningful test data that reflects production scenarios

## Environment Management
- `.env.example` committed with placeholder values
- `.env.local` in `.gitignore`
- Environment-specific configs via `ConfigModule`
- Never use `process.env` directly - always use `ConfigService`

## Performance Guidelines
- Database queries: Use `select` to limit returned fields
- Use Redis for caching hot data
- Implement pagination on all list endpoints
- Use streaming for large responses
- Set appropriate timeouts on all HTTP calls
- Avoid N+1 queries
- Use `Promise.all()` for independent operations

## Deployment Checklist
- [ ] All tests pass
- [ ] Linting and type checks pass
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] Docker images built and tested
- [ ] Database migrations applied
- [ ] Monitoring and alerting configured
- [ ] Backup strategy verified
- [ ] SSL/TLS configured
- [ ] Rate limiting configured