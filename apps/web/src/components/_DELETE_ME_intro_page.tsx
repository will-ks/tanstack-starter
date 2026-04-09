import { useAuthSuspense } from "@repo/auth/tanstack/hooks";
import { Button } from "@repo/ui/components/button";
import { Link } from "@tanstack/react-router";
import { Suspense } from "react";

import { SignOutButton } from "~/components/sign-out-button";
import { ThemeToggle } from "~/components/theme-toggle";

/**
 * This is the intro component for TanStarter, which you may delete after creating the project.
 * Have fun!
 */
export function IntroPageDeleteMe() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 pt-16 pb-12 md:pt-32">
        <header className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              tanstack-starter
            </span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>

          <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            A <span className="text-yellow-500 dark:text-yellow-200">minimal</span> monorepo starter
            for TanStack Start.
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            A minimal, opinionated monorepo foundation for building type-safe web applications
            without the extra boilerplate.
          </p>
        </header>

        <Suspense fallback={<div className="py-6">Loading session...</div>}>
          <UserAction />
        </Suspense>

        <section className="mb-16 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
          <Feature
            title="Full-Stack Foundation"
            desc="Build on a modern full-stack framework with TanStack Start, Router, and Vite."
          />
          <Feature
            title="Only the Essentials"
            desc="Drizzle ORM, Better Auth, shadcn/ui. Less boilerplate that you'll end up deleting anyway."
          />
          <Feature
            title="End-to-end Type Safety"
            desc="Effortless type safety powered by TanStack Router and Start server functions."
          />
          <Feature
            title="Next-Gen Tooling"
            desc="Powered by Vite+, which includes Vite 8, Rolldown, and Oxc for a faster development workflow."
          />
        </section>

        <section className="mb-12 space-y-2">
          {TECH_BADGE_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap items-center justify-center gap-2">
              {row.map((badge) => (
                <a
                  key={badge.alt}
                  href={badge.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                >
                  <img alt={badge.alt} src={badge.src} />
                </a>
              ))}
            </div>
          ))}
        </section>

        <section className="mx-auto mb-16 hidden max-w-[60ch] space-y-3 bg-card/50 p-4 text-sm text-foreground/80 sm:block">
          <p>
            You may delete this component at{" "}
            <span className="rounded-md border border-border bg-card px-1 py-1.5 font-mono">
              components/_DELETE_ME_intro_page.tsx
            </span>{" "}
            after creating your project.
          </p>

          <p>Happy coding!</p>
        </section>
      </div>
    </div>
  );
}

function UserAction() {
  const { user } = useAuthSuspense();

  return user ? (
    <section className="mb-20 flex flex-col items-center space-y-1.5">
      <div className="mb-4 flex w-full items-center gap-2">
        <div className="size-2 animate-pulse rounded-full bg-primary"></div>
        <h2 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Session
        </h2>
      </div>
      <div className="mb-3 w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-border"></div>
            <div className="size-2.5 rounded-full bg-border"></div>
            <div className="size-2.5 rounded-full bg-border"></div>
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">
              useAuthSuspense() data
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70 uppercase">ReadOnly</span>
        </div>
        <div className="overflow-x-auto p-6">
          <pre className="font-mono text-xs leading-relaxed text-foreground/80">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>

      <Button render={<Link to="/login" />} className="w-fit" size="lg" nativeButton={false}>
        Go to /app
      </Button>
      <SignOutButton />
    </section>
  ) : (
    <section className="mb-20 space-y-1 text-center">
      <p>You are not signed in.</p>
      <Button render={<Link to="/login" />} className="w-fit" size="lg" nativeButton={false}>
        Log in
      </Button>
    </section>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

interface TechBadge {
  alt: string;
  href: string;
  src: string;
}

const CORE_BADGES: TechBadge[] = [
  {
    alt: "React version",
    href: "https://react.dev",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog.react&label=react&style=flat-square",
  },
  {
    alt: "React Compiler version",
    href: "https://react.dev/learn/react-compiler",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog%5B%22babel-plugin-react-compiler%22%5D&label=react-compiler&style=flat-square",
  },
  {
    alt: "TanStack Start version",
    href: "https://tanstack.com/start/latest",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog%5B%22%40tanstack%2Freact-start%22%5D&label=tanstack-start&style=flat-square",
  },
  {
    alt: "TanStack Query version",
    href: "https://tanstack.com/query/latest",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog%5B%22%40tanstack%2Freact-query%22%5D&label=tanstack-query&style=flat-square",
  },
];

const UI_BADGES: TechBadge[] = [
  {
    alt: "Tailwind CSS version",
    href: "https://tailwindcss.com/",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog.tailwindcss&label=tailwindcss&style=flat-square",
  },
  {
    alt: "shadcn/ui version",
    href: "https://ui.shadcn.com/",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog.shadcn&label=shadcn%2Fui&style=flat-square",
  },
  {
    alt: "Base UI version",
    href: "https://base-ui.com/",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog%5B%22%40base-ui%2Freact%22%5D&label=base-ui&style=flat-square",
  },
];

const DATA_BADGES: TechBadge[] = [
  {
    alt: "Drizzle ORM version",
    href: "https://orm.drizzle.team/",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog%5B%22drizzle-orm%22%5D&label=drizzle-orm&style=flat-square",
  },
  {
    alt: "Better Auth version",
    href: "https://www.better-auth.com/",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog%5B%22better-auth%22%5D&label=better-auth&style=flat-square",
  },
];

const PLATFORM_BADGES: TechBadge[] = [
  {
    alt: "Vite+ version",
    href: "https://viteplus.dev",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog.vite-plus&label=vite-plus&style=flat-square",
  },
  {
    alt: "Nitro version",
    href: "https://nitro.build/",
    src: "https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmugnavo%2Ftanstarter-plus%2Fmain%2Fpnpm-workspace.yaml&query=%24.catalog.nitro&label=nitro&style=flat-square",
  },
];

const TECH_BADGE_ROWS = [CORE_BADGES, UI_BADGES, DATA_BADGES, PLATFORM_BADGES];
