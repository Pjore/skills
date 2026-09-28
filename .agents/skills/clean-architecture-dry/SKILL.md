---
name: clean-architecture-dry
description: "Clean Architecture and DRY principles for building maintainable, testable, and scalable software systems. Use when designing module boundaries, reviewing where business logic should live, evaluating repository/service abstractions, or spotting duplicated logic during code review."
---

# Clean Architecture & DRY

Default architectural approach for all software development.

## Dependency Rule

Dependencies point inward only. Inner layers never depend on outer ones.

```
domain (entities)  <-  application (use-cases)  <-  interface adapters  <-  frameworks/drivers
```

```typescript
// Bad — domain depends on infrastructure
class User { save() { database.insert(this); } }

// Good — infrastructure depends on domain
interface IUserRepository { save(user: User): Promise<void>; }
class UserRepository implements IUserRepository {
  async save(user: User) { await database.insert(user); }
}
```

## Core Properties

- **Framework-independent** — business rules don't import Express/Fastify/etc; use-cases take plain DTOs, not `Request`/`Response`.
- **Testable in isolation** — domain and use-case tests need no DB, UI, or network.
- **UI-independent** — no pricing/discount/validation logic in controllers or components.
- **Database-independent** — domain talks to `IRepository` interfaces, never an ORM/SQL client directly.
- **External-service-independent** — wrap payment gateways, email providers, etc. behind an interface owned by the domain.

## Suggested Layout

```
src/
├── domain/          # entities, value objects, repository interfaces
├── application/      # use-cases, DTOs, service interfaces
├── infrastructure/    # repositories, DB, external services, config
└── presentation/      # controllers, presenters, middleware
```

## DRY: Knowledge, Not Just Code

DRY targets duplicated *knowledge*, not incidental structural similarity — two small classes that happen to look alike are not a violation; don't prematurely abstract them together.

- **Single source of truth** — extract shared validation/business rules into one value object or function, not copies per caller.
- **Extract common logic** — repeated try/catch, retry, or mapping code becomes a shared helper (e.g. `executeQuery(operation, context)`).
- **Configuration over duplication** — one parameterized config/type instead of near-identical structs per environment.

## Common Violations to Flag in Review

- Business logic (discount/tax/validation math) inside a controller or React component
- A use-case that imports a web framework type or an ORM model directly
- The same validation regex/rule copy-pasted in two or more places
- A domain entity calling `fetch`/`axios`/a DB client directly instead of through an injected interface
