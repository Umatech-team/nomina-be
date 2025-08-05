# Copilot Instructions for Nomina Backend

## Project Overview

This is a personal finance management API ("Nomina") built with NestJS, following Domain-Driven Design principles. The system manages members, financial transactions, and savings goals with multi-tenancy per member.

## Architecture Patterns

### Module Structure

Each domain module follows a strict folder convention:

```
src/modules/{domain}/
├── {Domain}.module.ts      # NestJS module with DI setup
├── controllers/            # HTTP controllers with ApiTags
├── dto/                   # Data transfer objects
├── entities/              # Domain entities extending AggregateRoot
├── errors/                # Domain-specific error classes
├── gateways/              # Zod validation pipes
├── presenters/            # Response formatters
├── repositories/contracts/ # Abstract repository interfaces
└── services/              # Application services implementing Service<Request, Errors, Response>
```

### Domain Entities

- All entities extend `AggregateRoot<Props>` from `@shared/core/Entities/`
- Use `Optional<DTO, 'field1' | 'field2'>` for constructor props with defaults
- Implement getters/setters with `touch()` method for `updatedAt`
- Domain events support available but not currently used

### Service Pattern

Services implement `Service<Request, Errors, Response>` interface:

```typescript
async execute(request: Request): Promise<Either<Errors, Response>>
```

- Use `Either<L, R>` from `@shared/core/errors/Either` for error handling
- Return `left(error)` for failures, `right(data)` for success
- Controllers check `result.isLeft()` and use `ErrorPresenter.toHTTP()`

### Repository Pattern

- Abstract repository contracts in `repositories/contracts/`
- Prisma implementations in `@infra/databases/prisma/{domain}/`
- Dependency injection via `DatabaseModule` with abstract class tokens

## Key Conventions

### Authentication

- JWT with RS256 using private/public key pair from env
- `@Public()` decorator for unprotected endpoints
- Global `JwtAuthGuard` with member ID extraction
- Refresh token system with database storage

### Validation

- Zod schemas in `gateways/` folder as validation pipes
- Custom `ZodValidationPipe` for request validation
- Error messages in Portuguese

### Database

- Prisma ORM with PostgreSQL
- Migration files in `prisma/migrations/`
- Enum definitions in both Prisma schema and `@constants/enums.ts`

### Path Aliases

Use TypeScript path aliases extensively:

- `@modules/` → `src/modules/`
- `@shared/` → `src/shared/`
- `@infra/` → `src/infra/`
- `@providers/` → `src/providers/`
- `@constants/` → `src/constants/`

## Development Workflow

### Essential Commands

```bash
bun dev                    # Start development server
bun run prisma:migrate     # Run pending migrations
bun run prisma:studio      # Open Prisma Studio
bun test                   # Run unit tests
bun run test:e2e          # Run e2e tests
```

### Database Operations

- Monthly summaries auto-created when members register
- Transaction CRUD affects member balance calculations
- Multi-currency support (default BRL)

### API Documentation

- Swagger available at `/docs` endpoint
- Controllers use `@ApiTags()` for organization
- Bearer auth configured globally

## Common Patterns to Follow

### Adding New Endpoints

1. Create DTO in `dto/` folder
2. Create Zod gateway in `gateways/`
3. Implement service with Either pattern
4. Add controller with proper decorators
5. Export service in module providers

### Error Handling

- Domain errors extend base error classes
- Use `ErrorPresenter.toHTTP()` in controllers
- Service errors are typed in service interface

### Testing

- Unit tests co-located with source files (`.spec.ts`)
- E2E tests in `/test` folder
- Path mapping configured for Jest

When implementing features, maintain the established patterns and folder structure. The codebase prioritizes type safety, domain separation, and functional error handling.
