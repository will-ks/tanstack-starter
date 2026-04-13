# @repo/ui

shadcn/ui components, hooks, and utilities shared across the monorepo. Uses `base-maia` style with Tailwind CSS.

## Structure

```
├── components/        # shadcn/ui primitives (button, input, dropdown-menu, etc.)
├── hooks/             # Shared React hooks (use-mobile)
├── lib/               # Utilities (cn via clsx+tailwind-merge, theme-provider)
├── styles/            # base.css — Tailwind base styles with CSS variables
└── components.json    # shadcn/ui config (style, aliases, paths)
```

## Adding Components

```bash
pnpm ui add <component>    # Adds to packages/ui/components/
```

New components are auto-exported via `@repo/ui/components/<name>`. The shadcn CLI reads `components.json` for aliases and style config.

## Exports

```typescript
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import { ThemeProvider } from "@repo/ui/lib/theme-provider";
import { useMobile } from "@repo/ui/hooks/use-mobile";
import "@repo/ui/styles/base.css";
```

Wildcard exports in `package.json`: `@repo/ui/components/*`, `@repo/ui/lib/*`, `@repo/ui/hooks/*`.

## Conventions

- All components use `class-variance-authority` (cva) for variant styling
- Utility function `cn()` (clsx + tailwind-merge) from `lib/utils.ts`
- Icons: `lucide-react` with `Icon` suffix (`Loader2Icon`), brand icons from `@icons-pack/react-simple-icons`
- Base UI (`@base-ui/react`) as the primitive layer beneath shadcn components
- Peer deps: `react` and `react-dom` (provided by consuming app)

## Anti-Patterns

- **NEVER** add app-specific components here — put those in `apps/web/src/components/`
- **NEVER** import from `@repo/ui` without a subpath — use `@repo/ui/components/button`, not `@repo/ui`
