# @repo/jobs

Background task processing with [pg-boss](https://github.com/timgit/pg-boss). Job queue backed by PostgreSQL.

## Files

| File                      | Edit?  | Purpose                                                       |
| ------------------------- | ------ | ------------------------------------------------------------- |
| `src/boss.ts`             | ✅ YES | PgBoss singleton, `getBoss()`, `send()`, `stopBoss()` helpers |
| `src/workers/index.ts`    | ✅ YES | `registerWorkers()` — register all workers here               |
| `src/workers/greeting.ts` | ✅ YES | Example worker (template for new workers)                     |
| `src/index.ts`            | ✅ YES | Public API re-exports                                         |

## Workflow

1. Define a worker handler in `src/workers/<name>.ts`
2. Add queue name to the `QUEUES` array in `src/workers/index.ts`
3. Register the worker in `src/workers/index.ts` via `work()`
4. Queue jobs from server functions with `send()`

> **Queues must be created** before workers can be registered. Add every queue name to the `QUEUES` array in `registerWorkers()` — pg-boss requires explicit `createQueue()` calls.

## Adding a New Worker

```typescript
// 1. Create src/workers/my-task.ts
import type { WorkHandler } from "../boss";

export interface MyTaskPayload {
  // typed job data
}

export const myTaskWorker: WorkHandler<MyTaskPayload> = async ([job]) => {
  const {
    /* fields */
  } = job.data;
  // do work
  return { result: "done" };
};

// 2. Register in src/workers/index.ts
import { myTaskWorker } from "./my-task";
// Add "my-task" to the QUEUES array, then:
await work("my-task", myTaskWorker);

// 3. Queue from a server function
import { send } from "@repo/jobs";
const jobId = await send("my-task", {
  /* payload */
});
```

## Queueing Jobs with Options

```typescript
import { send } from "@repo/jobs";

// With retry and delay
await send("my-task", data, {
  retryLimit: 3,
  retryDelay: 60,
  startAfter: new Date(Date.now() + 60_000),
});
```

## Dashboard

Monitor jobs with the standalone dashboard:

```bash
DATABASE_URL="postgres://..." pnpm jobs:dashboard
```

Requires `DATABASE_URL` in your shell environment.

## Exports

```typescript
import { send, getBoss, registerWorkers, stopBoss } from "@repo/jobs";
import type { WorkHandler, SendOptions, WorkOptions } from "@repo/jobs";
```

- `send(queue, data, options?)` — Queue a job (most common)
- `getBoss()` — Get the PgBoss singleton (advanced use)
- `registerWorkers()` — Called once at server boot by the Nitro plugin
- `stopBoss()` — Graceful shutdown (called by Nitro close hook)

## Conventions

- Worker handlers receive an **array** of jobs — destructure first with `([job])`
- Each worker file exports a typed `WorkHandler<TPayload>` and its payload interface
- Queue names are plain strings (e.g. `"greeting"`, `"send-email"`)
- pg-boss creates its own `pgboss` schema in PostgreSQL on first start

## Anti-Patterns

- **NEVER** call `getBoss()` in client-side code — server-only
- **NEVER** create a new `PgBoss()` instance — use `getBoss()` singleton
- **NEVER** register workers outside of `registerWorkers()` — they must be registered at boot
- **NEVER** do heavy work in the `send()` call path — that's what the queue is for

## Configuration

PgBoss is configured in `src/boss.ts` with these defaults:

- Schema: `pgboss` (separate from app tables)
- `persistWarnings: true` — warnings stored for dashboard
- `warningRetentionDays: 30`
- Uses `DATABASE_URL` env var (same as `@repo/db`)
