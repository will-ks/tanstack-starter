# @repo/utils

General-purpose TypeScript utilities shared across the workspace.

Why

- Single home for small, pure helpers used by multiple packages and apps, so they don't get duplicated.

Notes

- No runtime dependencies. Keep helpers small, pure, and tree-shakeable.
- Import from the root: `import { exampleUtil } from "@repo/utils";`
- Consuming packages add `"@repo/utils": "workspace:*"` to their dependencies.
