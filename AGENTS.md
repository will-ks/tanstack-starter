# Agent Guidelines

**Commit:** b0cae95 | **Branch:** main | **Node:** >=24 | **PM:** pnpm@10.33.0

## Essentials

- Stack: TypeScript + React (TanStack Start) in a pnpm + Vite+ monorepo, with ZenStack v3, shadcn/ui, Better Auth, and pg-boss.
- Prefer shared `@repo/ui` components; add primitives via shadcn CLI (`pnpm ui add <component>`).
- Use `lucide-react` for UI icons (use `Icon` suffix, e.g. `import { Loader2Icon } from "lucide-react"`); for brand icons use `@icons-pack/react-simple-icons` (e.g. `SiGithub`).
- Use shared pnpm catalog versions (`pnpm-workspace.yaml`) via `catalog:`.
- For TanStack libraries, consult latest docs via `pnpm tanstack <command>` (see [Workflow](.agents/workflow.md#tanstack-cli)).
- Don't build after every little change. If `pnpm lint` passes; assume changes work.

## Structure

```
.
├── apps/web/                  # TanStack Start app (routes, components, router)
│   └── src/routes/            # File-based routing
│       ├── __root.tsx         # Root layout, devtools, theme
│       ├── _auth/             # Protected routes (beforeLoad guard)
│       ├── _guest/            # Guest-only routes (login, signup)
│       └── api/auth/          # Better Auth API handler
├── packages/
│   ├── auth/                  # @repo/auth - Better Auth + TanStack integration
│   ├── db/                    # @repo/db - ZenStack ORM + PostgreSQL
│   ├── jobs/                  # @repo/jobs - pg-boss background task queue
│   ├── mailer/                # @repo/mailer - Email sending (nodemailer)
│   └── ui/                    # @repo/ui - shadcn/ui components & utilities
├── tooling/tsconfig/          # @repo/tsconfig - shared TS base config
└── .agents/                   # Detailed topic guides
```

## Where to Look

| Task                       | Location                                        | Notes                                                                |
| -------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| Add a page/route           | `apps/web/src/routes/`                          | File-based routing; `_auth/` for protected, `_guest/` for guest-only |
| Add shared UI component    | `packages/ui/components/`                       | `pnpm ui add <name>`; exported as `@repo/ui/components/<name>`       |
| Add app-specific component | `apps/web/src/components/`                      | Local to web app                                                     |
| Edit auth config           | `packages/auth/src/auth.ts`                     | Better Auth server config (social providers, session)                |
| Edit auth middleware       | `packages/auth/src/tanstack/middleware.ts`      | `authMiddleware`, `freshAuthMiddleware`                              |
| Edit DB schema             | `packages/db/zenstack/schema.zmodel`            | Then run `pnpm db` to regenerate                                     |
| Add background job         | `packages/jobs/src/workers/`                    | Create queue, add handler, register in `workers/index.ts`            |
| Queue a job                | `send()` from `@repo/jobs`                      | Call from server functions                                           |
| Monitor jobs               | `pnpm jobs:dashboard`                           | Requires `DATABASE_URL` in environment                               |
| Add server function        | `apps/web/src/utils/`                           | Prefix with `$`, wrap in `createServerFn`, use `~/` alias in routes  |
| Add TanStack query         | Near the consuming code or in auth `queries.ts` | Use `queryOptions()` pattern                                         |
| Auto-CRUD over HTTP        | `apps/web/src/routes/api/model/$.ts`            | ZenStack endpoint — every model gets `/api/model/<model>/<op>`       |
| Auto-CRUD React hooks      | `apps/web/src/lib/zenstack.ts`                  | `useDb()` returns typed TanStack Query hooks per model               |
| Lint/format config         | `vite.config.ts` (root)                         | Oxfmt + Oxlint via Vite+                                             |
| Vite/build config          | `apps/web/vite.config.ts`                       | TanStack Start, Nitro, React Compiler                                |

## Commands

```bash
pnpm dev          # Dev server (all packages)
pnpm dev:web      # Dev server (web only)
pnpm lint         # Type-check + type-aware lint (Oxlint)
pnpm check        # Format + lint + type-check
pnpm build        # Production build (all)
pnpm db           # Generate ZenStack types (run after schema changes)
pnpm db:push      # Push schema to database
pnpm jobs:dashboard  # pg-boss monitoring dashboard (needs DATABASE_URL)
pnpm ui           # shadcn/ui CLI (adds to packages/ui)
pnpm ui:web       # shadcn/ui CLI (adds to apps/web)
```

## Conventions

- **Oxfmt** (not Prettier): double quotes, 100 char width, trailing commas, LF endings
- **Oxlint** (not ESLint): type-aware linting with TanStack Router/Query plugins + React Compiler rules
- **Path aliases**: `~/` → `apps/web/src/`, `@repo/*` → workspace packages
- **Icon imports**: `lucide-react` with `Icon` suffix (`Loader2Icon`), brand icons from `@icons-pack/react-simple-icons` _(enforced by `eslint-local/icon-import-suffix`)_
- **Server functions**: prefix with `$` (`$getUser`), static imports only (never dynamic), defined in `apps/web/src/utils/**` _(enforced by `server-fn-name-prefix`, `no-dynamic-server-import`, `server-fn-in-utils-only`)_
- **Query pattern**: `queryOptions()` factories, `ensureQueryData` in loaders _(enforced by `eslint-tanstack-query/prefer-query-options`)_
- **Auto-CRUD first**: prefer `useDb()` hooks (or `authDb.<model>.<op>()` in loaders) over hand-written server functions for pure CRUD. See `.agents/tanstack-patterns.md#auto-crud-vs-server-functions` _(enforced by `eslint-local/no-pure-crud-server-fn`)_
- **Tests**: Not set up yet. Lint is the validation gate.

## Anti-Patterns

- **NEVER** use `as`, `satisfies`, or manual generic params — infer types instead (see `.agents/typescript.md`)
- **NEVER** dynamically import server functions — use static imports _(enforced by `eslint-local/no-dynamic-server-import`)_
- **NEVER** use pnpm/npm/yarn directly — use `vp` commands (see `.agents/vite-plus.md`)
- **NEVER** edit generated files in `packages/db/zenstack/` (except `schema.zmodel`)
- **NEVER** import raw `db` from `@repo/db/internal` in `@repo/web` — use `authDb` from `@repo/db` instead _(enforced by `eslint-local/no-db-internal`)_
- **NEVER** skip `authMiddleware` on protected server functions, even inside `_auth` routes _(enforced by `eslint-local/protected-server-fn-requires-auth-middleware`)_
- Generic type params must be `T`-prefixed: `TArgs`, `TReturn`, `TData`

## Mechanically Enforced Rules

Conventions backed by lint rules in `tooling/lint/` and TanStack's ESLint plugins (loaded via `vite.config.ts` → `lint.jsPlugins`). Run `pnpm lint` to verify. See `tooling/lint/README.md` for the full list.

- **Server functions**: `$`-prefix, defined in `apps/web/src/utils/**/*.{functions,server}.ts`, static imports only, `authMiddleware`/`freshAuthMiddleware` chained
- **TanStack Query**: prefer `queryOptions()`/`infiniteQueryOptions()` factories (rule `prefer-query-options`); never inline `useQuery({ queryKey, queryFn })` in components
- **Cache invalidation**: only via global `MutationCache` in `apps/web/src/router.tsx`; never call `queryClient.invalidateQueries()` elsewhere
- **Mutations**: writes must go through `useMutation`, never fire-and-forget in JSX event handlers
- **Auto-CRUD**: pure CRUD belongs in `useDb()` hooks, not server functions (rule `no-pure-crud-server-fn`)
- **Icons**: `lucide-react` imports must end in `Icon`; `@icons-pack/react-simple-icons` must start with `Si`
- **DB**: never import `db` from `@repo/db/internal` in the web app

Opt out per-line with `// eslint-local/<rule-name>: off`.

## Topic-specific Guidelines

- [TanStack patterns](.agents/tanstack-patterns.md) - Routing, data fetching, loaders, server functions, environment shaking
- [Auth patterns](.agents/auth.md) - Route guards, middleware, auth utilities
- [TypeScript conventions](.agents/typescript.md) - Casting rules, prefer type inference
- [Workflow](.agents/workflow.md) - Workflow commands, validation approach
- [Vite+](.agents/vite-plus.md) - Vite+ commands, common pitfalls

<!-- intent-skills:start -->

# Skill mappings - when working in these areas, load the linked skill file into context.

skills:

- task: "general TanStack Router and @tanstack/react-router docs for routes, layouts, route tree, and navigation"
  load: "apps/web/node_modules/@tanstack/react-router/dist/llms/index.js"
- task: "general TanStack Start and @tanstack/react-start docs for app structure, patterns, and server features"
  load: "apps/web/node_modules/@tanstack/react-start/skills/react-start/SKILL.md"

<!-- intent-skills:end -->

## TanStack Docs

Use `pnpm tanstack` (which is aliased to `vpx @tanstack/cli@latest` in `package.json`) to look up TanStack documentation. Always pass `--json` for machine-readable output.

```bash
pnpm tanstack doc router framework/react/guide/data-loading --json
pnpm tanstack search-docs "server functions" --library start --json
```

## Code Standards

### Quick Reference

**Core Philosophy**: Modular, Functional, Maintainable
**Golden Rule**: If you can't easily test it, refactor it

**Critical Patterns** (use these):

- ✅ Pure functions (same input = same output, no side effects)
- ✅ Immutability (create new data, don't modify)
- ✅ Composition (build complex from simple)
- ✅ Small functions (< 50 lines)
- ✅ Explicit dependencies (dependency injection)

**Anti-Patterns** (avoid these):

- ❌ Mutation, side effects, deep nesting
- ❌ God modules, global state, large functions

---

### Core Philosophy

**Modular**: Everything is a component - small, focused, reusable
**Functional**: Pure functions, immutability, composition over inheritance
**Maintainable**: Self-documenting, testable, predictable

### Principles

#### Modular Design

- Single responsibility per module
- Clear interfaces (explicit inputs/outputs)
- Independent and composable
- < 100 lines per component (ideally < 50)

#### Functional Approach

- **Pure functions**: Same input = same output, no side effects
- **Immutability**: Create new data, don't modify existing
- **Composition**: Build complex from simple functions
- **Declarative**: Describe what, not how

#### Component Structure

```
component/
├── index.js      # Public interface
├── core.js       # Core logic (pure functions)
├── utils.js      # Helpers
└── tests/        # Tests
```

### Patterns

#### Pure Functions

```javascript
// ✅ Pure
const add = (a, b) => a + b;
const formatUser = (user) => ({
  ...user,
  fullName: `${user.firstName} ${user.lastName}`,
});

// ❌ Impure (side effects)
let total = 0;
const addToTotal = (value) => {
  total += value;
  return total;
};
```

#### Immutability

```javascript
// ✅ Immutable
const addItem = (items, item) => [...items, item];
const updateUser = (user, changes) => ({ ...user, ...changes });

// ❌ Mutable
const addItem = (items, item) => {
  items.push(item);
  return items;
};
```

#### Composition

```javascript
// ✅ Compose small functions
const processUser = pipe(validateUser, enrichUserData, saveUser);
const isValidEmail = (email) => validateEmail(normalizeEmail(email));

// ❌ Deep inheritance
class ExtendedUserManagerWithValidation extends UserManager {}
```

#### Declarative

```javascript
// ✅ Declarative
const activeUsers = users.filter((u) => u.isActive).map((u) => u.name);

// ❌ Imperative
const names = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) names.push(users[i].name);
}
```

### Naming

- **Files**: lowercase-with-dashes.js
- **Functions**: verbPhrases (getUser, validateEmail)
- **Predicates**: isValid, hasPermission, canAccess
- **Variables**: descriptive (userCount not uc), const by default
- **Constants**: UPPER_SNAKE_CASE

### Error Handling

```javascript
// ✅ Explicit error handling
function parseJSON(text) {
  try {
    return { success: true, data: JSON.parse(text) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ✅ Validate at boundaries
function createUser(userData) {
  const validation = validateUserData(userData);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }
  return { success: true, user: saveUser(userData) };
}
```

### Dependency Injection

```javascript
// ✅ Dependencies explicit
function createUserService(database, logger) {
  return {
    createUser: (userData) => {
      logger.info("Creating user");
      return database.insert("users", userData);
    },
  };
}

// ❌ Hidden dependencies
import db from "./database.js";
function createUser(userData) {
  return db.insert("users", userData);
}
```

### Anti-Patterns

❌ **Mutation**: Modifying data in place
❌ **Side effects**: console.log, API calls in pure functions
❌ **Deep nesting**: Use early returns instead
❌ **God modules**: Split into focused modules
❌ **Global state**: Pass dependencies explicitly
❌ **Large functions**: Keep < 50 lines

### Best Practices

✅ Pure functions whenever possible
✅ Immutable data structures
✅ Small, focused functions (< 50 lines)
✅ Compose small functions into larger ones
✅ Explicit dependencies (dependency injection)
✅ Validate at boundaries
✅ Self-documenting code
✅ Test in isolation

**Golden Rule**: If you can't easily test it, refactor it.

## Documentation Standards

### Quick Reference

**Golden Rule**: If users ask the same question twice, document it

**Document** (✅ DO):

- WHY decisions were made
- Complex algorithms/logic
- Public APIs, setup, common use cases

**Don't Document** (❌ DON'T):

- Obvious code (i++ doesn't need comment)
- What code does (should be self-explanatory)

**Principles**: Audience-focused, Show don't tell, Keep current

---

### Principles

**Audience-focused**: Write for users (what/how), developers (why/when), contributors (setup/conventions)
**Show, don't tell**: Code examples, real use cases, expected output
**Keep current**: Update with code changes, remove outdated info, mark deprecations

### README Structure

````markdown
# Project Name

Brief description (1-2 sentences)

## Features

- Key feature 1
- Key feature 2

## Installation

```bash
npm install package-name
```

## Quick Start

```javascript
const result = doSomething();
```

## Usage

[Detailed examples]

## API Reference

[If applicable]

## Contributing

[Link to CONTRIBUTING.md]

## License

[License type]
````

### Function Documentation

```javascript
/**
 * Calculate total price including tax
 *
 * @param {number} price - Base price
 * @param {number} taxRate - Tax rate (0-1)
 * @returns {number} Total with tax
 *
 * @example
 * calculateTotal(100, 0.1) // 110
 */
function calculateTotal(price, taxRate) {
  return price * (1 + taxRate);
}
```

### What to Document

#### ✅ DO

- **WHY** decisions were made
- Complex algorithms/logic
- Non-obvious behavior
- Public APIs
- Setup/installation
- Common use cases
- Known limitations
- Workarounds (with explanation)

#### ❌ DON'T

- Obvious code (i++ doesn't need comment)
- What code does (should be self-explanatory)
- Redundant information
- Outdated/incorrect info

### Comments

#### Good

```javascript
// Calculate discount by tier (Bronze: 5%, Silver: 10%, Gold: 15%)
const discount = getDiscountByTier(customer.tier);

// HACK: API returns null instead of [], normalize it
const items = response.items || [];

// TODO: Use async/await when Node 18+ is minimum
```

#### Bad

```javascript
// Increment i
i++;

// Get user
const user = getUser();
```

### API Documentation

````markdown
### POST /api/users

Create a new user

**Request:**

```json
{ "name": "John", "email": "john@example.com" }
```

**Response:**

```json
{ "id": "123", "name": "John", "email": "john@example.com" }
```

**Errors:**

- 400 - Invalid input
- 409 - Email exists
````

### Best Practices

✅ Explain WHY, not just WHAT
✅ Include working examples
✅ Show expected output
✅ Cover error handling
✅ Use consistent terminology
✅ Keep structure predictable
✅ Update when code changes

**Golden Rule**: If users ask the same question twice, document it.

<!-- Context: standards/patterns | Priority: high | Version: 2.0 | Updated: 2025-01-21 -->

## Essential Patterns - Core Knowledge Base

### Quick Reference

**Critical Patterns**: Error Handling, Validation, Security, Logging

**ALWAYS**: Handle errors gracefully, validate input, use env vars for secrets

**NEVER**: Expose sensitive info, hardcode credentials, skip input validation

**Language-agnostic**: Apply to all programming languages

---

These are language-agnostic patterns that apply to all programming languages. Language-specific implementations are loaded from context files based on project detection.

### Error Handling Pattern

**ALWAYS** handle errors gracefully:

- Catch specific errors, not generic ones
- Log errors with context
- Return meaningful error messages
- Don't expose internal implementation details
- Use language-specific error handling mechanisms (try/catch, Result, error returns)

### Validation Pattern

**ALWAYS** validate input data:

- Check for null/nil/None values
- Validate data types
- Validate data ranges and constraints
- Sanitize user input
- Return clear validation error messages

### Logging Pattern

**USE** consistent logging levels:

- **Debug**: Detailed information for debugging (development only)
- **Info**: Important events and milestones
- **Warning**: Potential issues that don't stop execution
- **Error**: Failures and exceptions

### Security Pattern

**NEVER** expose sensitive information:

- Don't log passwords, tokens, or API keys
- Don't expose internal error details to users
- Validate and sanitize all user input
- Use environment variables for secrets
- Follow principle of least privilege

### File System Safety Pattern

**ALWAYS** validate file paths:

- Prevent path traversal attacks
- Check file permissions before operations
- Use absolute paths when possible
- Handle file not found errors gracefully
- Close file handles properly

### Configuration Pattern

**ALWAYS** use environment variables for configuration:

- Never hardcode secrets or credentials
- Provide sensible defaults
- Validate required configuration on startup
- Document all configuration options
- Use different configs for dev/staging/production

### Testing Pattern

**ALWAYS** write testable code:

- Use dependency injection
- Keep functions pure when possible
- Write unit tests for business logic
- Write integration tests for external dependencies
- Use test fixtures and mocks appropriately

### Documentation Pattern

**DOCUMENT** complex logic and public APIs:

- Explain the "why", not just the "what"
- Document function parameters and return values
- Include usage examples
- Keep documentation up to date with code
- Use language-specific documentation tools

### Performance Pattern

**AVOID** unnecessary operations:

- Don't repeat expensive calculations
- Cache results when appropriate
- Use efficient data structures
- Profile before optimizing
- Consider time and space complexity

### Code Organization Pattern

**KEEP** code modular and focused:

- Single Responsibility Principle - one function, one purpose
- Don't Repeat Yourself (DRY)
- Separate concerns (business logic, data access, presentation)
- Use meaningful names for functions and variables
- Keep functions small and focused (< 50 lines ideally)

### Dependency Management

**MANAGE** dependencies carefully:

- Pin dependency versions for reproducibility
- Regularly update dependencies for security
- Minimize number of dependencies
- Audit dependencies for security vulnerabilities
- Document why each dependency is needed

### Version Control

**FOLLOW** git best practices:

- Write clear, descriptive commit messages
- Make atomic commits (one logical change per commit)
- Use feature branches for development
- Review code before merging
- Keep main/master branch stable

### Code Review Checklist

**REVIEW** for these common issues:

- Error handling is comprehensive
- Input validation is present
- No hardcoded secrets or credentials
- Tests cover new functionality
- Documentation is updated
- Code follows project conventions
- No obvious security vulnerabilities
- Performance considerations addressed

## Testing Standards

### Quick Reference

**Golden Rule**: If you can't test it easily, refactor it

**AAA Pattern**: Arrange → Act → Assert

**Test** (✅ DO):

- Happy path, edge cases, error cases
- Business logic, public APIs

**Don't Test** (❌ DON'T):

- Third-party libraries, framework internals
- Simple getters/setters, private details

**Coverage**: Critical (100%), High (90%+), Medium (80%+)

---

### Principles

**Test behavior, not implementation**: Focus on what code does, not how
**Keep tests simple**: One assertion per test, clear names, minimal setup
**Independent tests**: No shared state, run in any order
**Fast and reliable**: Quick execution, no flaky tests, deterministic

### Test Structure (AAA Pattern)

```javascript
test("calculateTotal returns sum of item prices", () => {
  // Arrange - Set up test data
  const items = [{ price: 10 }, { price: 20 }, { price: 30 }];

  // Act - Execute code
  const result = calculateTotal(items);

  // Assert - Verify result
  expect(result).toBe(60);
});
```

### What to Test

#### ✅ DO Test

- Happy path (normal usage)
- Edge cases (boundaries, empty, null, undefined)
- Error cases (invalid input, failures)
- Business logic (core functionality)
- Public APIs (exported functions)

#### ❌ DON'T Test

- Third-party libraries
- Framework internals
- Simple getters/setters
- Private implementation details

### Coverage Goals

1. **Critical**: Business logic, data transformations (100%)
2. **High**: Public APIs, user-facing features (90%+)
3. **Medium**: Utilities, helpers (80%+)
4. **Low**: Simple wrappers, configs (optional)

### Testing Pure Functions

```javascript
function add(a, b) {
  return a + b;
}

test("add returns sum", () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-1, 1)).toBe(0);
  expect(add(0, 0)).toBe(0);
});
```

### Testing with Dependencies

```javascript
// Testable with dependency injection
function createUserService(database) {
  return {
    getUser: (id) => database.findById("users", id),
  };
}

// Test with mock
test("getUser retrieves from database", () => {
  const mockDb = {
    findById: jest.fn().mockReturnValue({ id: 1, name: "John" }),
  };

  const service = createUserService(mockDb);
  const user = service.getUser(1);

  expect(mockDb.findById).toHaveBeenCalledWith("users", 1);
  expect(user).toEqual({ id: 1, name: "John" });
});
```

### Test Naming

```javascript
// ✅ Good: Descriptive, clear expectation
test("calculateDiscount returns 10% off for premium users", () => {});
test("validateEmail returns false for invalid format", () => {});
test("createUser throws error when email exists", () => {});

// ❌ Bad: Vague, unclear
test("it works", () => {});
test("test user", () => {});
```

### Best Practices

✅ Test one thing per test
✅ Use descriptive test names
✅ Keep tests independent
✅ Mock external dependencies
✅ Test edge cases and errors
✅ Make tests readable
✅ Run tests frequently
✅ Fix failing tests immediately

**Golden Rule**: If you can't test it easily, refactor it.

## TypeScript Standards

---

### 1. Function Patterns

#### 1.1 Naming Convention

**Rule: Prefer explicit function names**

Prefer function names that clearly describe their purpose.
It should be clear what a function does without needing to read its implementation.
Long names are fine, we have autocomplete, so don't make users guess what a function does.
Function names should always start with a verb.

```typescript
// ✅ Good
export function getDefaultTitle() {...}          // Clear purpose, verb-based
export function isDefaultTitle(title: string) {...}      // Boolean predicate
export function assertNotBusy(sessionID: string) {...}   // Assertion pattern
export async function resolvePromptParts(template) {...} // Complex operation needs clarity

// ❌ AVOID
function foo() {...}  // Vague, unclear purpose
function doStuff() {...}  // Non-descriptive, generic
function handle() {...}  // Ambiguous, lacks context
function process() {...}  // Too generic, unclear what is being processed
```

#### 1.2 Pure Functions

**Rule: Prefer pure functions when possible**

```typescript
// ✅ GOOD - Pure function
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ AVOID - Side effects
let total = 0;
function addToTotal(item: Item) {
  total += item.price; // Mutates external state
}
```

#### 1.3 Function Composition

```typescript
// ✅ GOOD - Functional composition with pipes
const filtered = agents
  .filter((a) => a.mode !== "primary")
  .filter((a) => hasPermission(a, caller))
  .map((a) => a.name);

// ✅ GOOD - Higher-order functions
export function withRetry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  return fn().catch((error) => {
    if (maxRetries > 0) {
      return withRetry(fn, maxRetries - 1);
    }
    throw error;
  });
}
```

---

### 2. Type Safety

#### 2.1 TypeScript Types

**Rule: Use TypeScript's type system, avoid `any`**

```typescript
// ✅ GOOD - Explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User {
  // Implementation
}

// ❌ AVOID - any type
function getUser(id: any): any {
  // Loses all type safety
}
```

#### 2.2 Type Inference

**Rule: Let TypeScript infer when obvious**

```typescript
// ✅ GOOD - Inference works
const count = 42; // TypeScript knows this is number
const users = await fetchUsers(); // Type inferred from return type

// ❌ AVOID - Redundant annotations
const count: number = 42;
const users: User[] = await fetchUsers();
```

#### 2.3 Type Guards

**Rule: Use type guards for runtime type checking**

```typescript
// ✅ GOOD - Type guard
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value && "name" in value;
}

// Usage
if (isUser(data)) {
  console.log(data.name); // TypeScript knows data is User
}
```

#### 2.4 Avoid Any

**Rule: Use `unknown` instead of `any` when type is truly unknown**

```typescript
// ✅ GOOD - unknown requires type checking
function processData(data: unknown) {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
  throw new Error("Invalid data");
}

// ❌ AVOID - any bypasses type checking
function processData(data: any) {
  return data.toUpperCase(); // No compile-time safety
}
```

---

### 3. Array Operations

#### 3.1 Functional Methods (Preferred)

**Rule: Prefer map/filter/reduce over for-loops**

```typescript
// ✅ GOOD - Functional chain with type inference
const files = messages
  .flatMap((x) => x.parts)
  .filter((x): x is Patch => x.type === "patch")
  .flatMap((x) => x.files)
  .map((x) => path.relative(worktree, x));

// ✅ GOOD - Parallel async operations
const results = await Promise.all(
  toolCalls.map(async (call) => {
    return executeCall(call);
  }),
);

// ✅ GOOD - Reduce for aggregation
const totalAdditions = diffs.reduce((sum, x) => sum + x.additions, 0);

// ✅ GOOD - Unique values
const uniqueNames = Array.from(new Set(items.map((x) => x.name)));

// ✅ GOOD - Sorting
const sorted = items.toSorted((a, b) => a.timestamp - b.timestamp);
```

#### 3.2 For-Loops (When Necessary)

**Rule: Use for-loops only for:**

1. Algorithm complexity (DP, graph traversal)
2. Early exit requirements
3. Sequential side effects

```typescript
// ✅ GOOD - Early exit
const patches = [];
for (const msg of all) {
  if (msg.info.id === targetID) break;
  for (const part of msg.parts) {
    if (part.type === "patch") {
      patches.push(part);
    }
  }
}

// ✅ GOOD - Sequential mutations
for (const key of Object.keys(tools)) {
  if (disabled.has(key)) {
    delete tools[key];
  }
}
```

#### 3.3 Type Guards on Filter

**Rule: Use type guards to maintain type inference downstream**

```typescript
// ✅ GOOD - Type guard preserves type information
const patches = messages
  .flatMap((msg) => msg.parts)
  .filter((part): part is PatchPart => part.type === "patch");
// patches is now PatchPart[], not Part[]

// ❌ BAD - Loses type information
const patches = messages.flatMap((msg) => msg.parts).filter((part) => part.type === "patch");
// patches is still Part[], requires casting later
```

---

### 4. Async Patterns

#### 4.1 Parallel Execution (Default Pattern)

**Rule: Use `Promise.all` for independent operations**

```typescript
// ✅ GOOD - Parallel independent operations
const [language, cfg, provider, auth] = await Promise.all([
  getLanguage(model),
  getConfig(),
  getProvider(model.providerID),
  getAuth(model.providerID),
]);

// ✅ GOOD - Parallel array processing
const results = await Promise.all(
  items.map(async (item) => {
    return processItem(item);
  }),
);

// ❌ BAD - Sequential when independent
const language = await getLanguage(model);
const cfg = await getConfig(); // Could run in parallel!
const provider = await getProvider(model.providerID);
```

#### 4.2 Sequential Operations

**Rule: Chain when operations depend on previous results**

```typescript
// ✅ GOOD - Sequential dependency chain
const session = await createSession({ title: "New" });
const message = await addMessage(session.id, { content: "Hello" });
const response = await processMessage(message.id);

// ✅ GOOD - Promise chain for clarity
const result = await createSession({ title: "New" })
  .then((session) => addMessage(session.id, { content: "Hello" }))
  .then((message) => processMessage(message.id));
```

#### 4.3 Error Handling in Async

**Rule: Prefer `.catch()` over try/catch when possible**

```typescript
// ✅ GOOD - Catch at call site
const result = await operation().catch((error) => {
  console.error("Operation failed", error);
  return defaultValue;
});

// ✅ GOOD - Promise.all with error handling
const results = await Promise.all(
  items.map(async (item) => {
    return processItem(item).catch((error) => {
      console.error("Item failed", { item, error });
      return null;
    });
  }),
);

// ✅ ACCEPTABLE - try/catch for multiple operations
try {
  const session = await createSession(input);
  await addMessage(session.id, message);
  await publishEvent({ session });
  return session;
} catch (error) {
  console.error("Session creation failed", error);
  throw error;
}

// ❌ AVOID - try/catch for single operation
try {
  const result = await operation();
  return result;
} catch (error) {
  console.error(error);
  throw error;
}
// Better:
const result = await operation().catch((error) => {
  console.error(error);
  throw error;
});
```

---

### 5. Control Flow

#### 5.1 Early Returns

**Rule: Avoid `else` statements, use early returns**

```typescript
// ✅ GOOD - Early returns
function getStatus(session: Session) {
  if (!session) return "not_found";
  if (session.busy) return "busy";
  if (session.error) return "error";
  return "ready";
}

async function process(id: string) {
  const session = await getSession(id);
  if (!session) return { error: "Not found" };

  const result = await execute(session);
  if (!result.success) return { error: result.message };

  return { data: result.data };
}

// ❌ BAD - Else statements
function getStatus(session: Session) {
  if (!session) {
    return "not_found";
  } else {
    if (session.busy) {
      return "busy";
    } else {
      if (session.error) {
        return "error";
      } else {
        return "ready";
      }
    }
  }
}
```

#### 5.2 Guard Clauses

```typescript
// ✅ GOOD - Guard clauses at function start
async function updateSession(id: string, data: UpdateData) {
  if (!id) throw new Error("ID required");
  if (!data) throw new Error("Data required");
  if (data.title && data.title.length > 100) throw new Error("Title too long");

  // Main logic here
  const session = await getSession(id);
  await update(id, data);
  return session;
}
```

#### 5.3 Switch Statements

**Rule: Use exhaustive switch with default case**

```typescript
// ✅ GOOD - Exhaustive switch
function handleEvent(event: Event) {
  switch (event.type) {
    case "start":
      return handleStart(event);

    case "update":
      return handleUpdate(event);

    case "complete":
      return handleComplete(event);

    default:
      const _exhaustive: never = event;
      throw new Error(`Unhandled event type: ${(event as any).type}`);
  }
}
```

---

### 6. Code Organization

#### 6.1 Import Order

**Rule: Organize imports by source**

```typescript
// ✅ GOOD - Organized imports
// 1. Node built-ins
import path from "path";
import fs from "fs/promises";

// 2. External packages
import { z } from "zod";
import express from "express";

// 3. Internal modules
import { User } from "./types";
import { getConfig } from "./config";
```

#### 6.2 File Structure

**Rule: One primary export per file**

```typescript
// user.ts
export interface User {
  id: string;
  name: string;
}

export async function getUser(id: string): Promise<User> {
  // Implementation
}

export async function createUser(data: CreateUserInput): Promise<User> {
  // Implementation
}
```

---

### 7. Testing Principles

#### 7.1 Test Structure

**Rule: Follow Arrange-Act-Assert pattern**

```typescript
// ✅ GOOD - AAA pattern
test("creates user with valid data", async () => {
  // Arrange
  const userData = { name: "Alice", email: "alice@example.com" };

  // Act
  const user = await createUser(userData);

  // Assert
  expect(user.name).toBe("Alice");
  expect(user.email).toBe("alice@example.com");
});
```

#### 7.2 Coverage Goals

**Rule: Test both success and failure cases**

```typescript
// ✅ GOOD - Both positive and negative tests
describe("createUser", () => {
  test("creates user with valid data", async () => {
    const user = await createUser({
      name: "Alice",
      email: "alice@example.com",
    });
    expect(user).toBeDefined();
  });

  test("throws error with invalid email", async () => {
    await expect(createUser({ name: "Alice", email: "invalid" })).rejects.toThrow("Invalid email");
  });
});
```

#### 7.3 Mock External Dependencies

**Rule: Mock all external dependencies**

```typescript
// ✅ GOOD - Mocked dependencies
test("fetches user data", async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ id: "1", name: "Alice" }),
  });

  global.fetch = mockFetch;

  const user = await fetchUser("1");
  expect(user.name).toBe("Alice");
});
```

---

### 8. Variable Naming

#### 8.1 Variable Declaration

**Rule: Prefer `const` over `let`**

```typescript
// ✅ GOOD - Immutable with ternary
const foo = condition ? 1 : 2;
const result = await (isValid ? processValid() : processInvalid());

// ❌ BAD - Reassignment
let foo;
if (condition) {
  foo = 1;
} else {
  foo = 2;
}

// ✅ GOOD - Early return instead of reassignment
function getValue(condition: boolean) {
  if (condition) return 1;
  return 2;
}

// ✅ ACCEPTABLE - let when mutation is necessary
let accumulator = 0;
for (const item of items) {
  accumulator += item.value;
}
```
