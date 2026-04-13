# @new-stack/logger

A small, TypeScript-first wrapper around pino for the workspace.

Why

- Provides a single place to configure structured logging for services and apps in this monorepo.

Quick start

```ts
import { createLogger } from "@new-stack/logger";

const logger = createLogger({ name: "web", level: "info" });
logger.info("server started");

// per-request child
const child = logger.child({ requestId: "abc" });
child.info("handling request");
```

Notes

- Uses pino under the hood. The package exports a minimal, stable API so we can swap implementations later if needed.
