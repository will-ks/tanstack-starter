import { defineConfig } from "vite-plus";

// https://viteplus.dev/config/
export default defineConfig({
  // Git hooks for staged files - https://viteplus.dev/guide/commit-hooks
  staged: {
    "*": "vp fmt --no-error-on-unmatched-pattern",
  },

  // Vite Task
  // https://viteplus.dev/config/run
  // https://viteplus.dev/guide/run
  run: {
    cache: {
      // Disabled since Vite+ only replays terminal output, not build artifacts.
      // Enable if your platform preserves build outputs between deployments.
      // see: https://github.com/mugnavo/tanstarter-plus/issues/8
      tasks: false,
    },
  },

  // Oxfmt - https://oxc.rs/docs/guide/usage/formatter/config.html
  fmt: {
    tabWidth: 2,
    semi: true,
    printWidth: 100,
    singleQuote: false,
    endOfLine: "lf",
    trailingComma: "all",
    sortImports: {},
    sortTailwindcss: {
      stylesheet: "./packages/ui/styles/base.css",
      attributes: ["class", "className"],
      functions: ["clsx", "cn", "cva", "tw"],
    },
    sortPackageJson: true,
    ignorePatterns: [
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
      "bun.lock",
      "routeTree.gen.ts",
      ".tanstack-start/",
      ".tanstack/",
      "drizzle/",
      "migrations/",
      ".drizzle/",
      "zenstack/",
      ".cache",
      "worker-configuration.d.ts",
      ".vercel",
      ".output",
      ".wrangler",
      ".netlify",
      "dist",
    ],
  },

  // Oxlint - https://oxc.rs/docs/guide/usage/linter/config
  lint: {
    plugins: ["typescript", "react", "react-perf", "jsx-a11y", "node"],
    env: {
      builtin: true,
      node: true,
      browser: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      { name: "react-hooks-js", specifier: "eslint-plugin-react-hooks" },
      // Plugins with "/" in name have to be aliased for now
      // Issue: https://github.com/oxc-project/oxc/issues/14557
      {
        name: "eslint-tanstack-router",
        specifier: "@tanstack/eslint-plugin-router",
      },
      {
        name: "eslint-tanstack-query",
        specifier: "@tanstack/eslint-plugin-query",
      },
      {
        name: "eslint-local",
        specifier: "./tooling/lint/index.cjs",
      },
    ],
    rules: {
      "eslint-local/no-db-internal": "error",
      "eslint-local/no-dynamic-server-import": "error",
      "eslint-local/server-fn-name-prefix": "error",
      "eslint-local/server-fn-in-utils-only": "error",
      "eslint-local/no-manual-invalidate-queries": "error",
      "eslint-local/icon-import-suffix": "error",
      "eslint-local/no-fire-and-forget-mutation": "error",
      "eslint-local/protected-server-fn-requires-auth-middleware": "error",
      "eslint-local/no-pure-crud-server-fn": "error",
      "eslint-tanstack-query/exhaustive-deps": "error",
      "eslint-tanstack-query/infinite-query-property-order": "error",
      "eslint-tanstack-query/mutation-property-order": "error",
      "eslint-tanstack-query/no-rest-destructuring": "error",
      "eslint-tanstack-query/no-unstable-deps": "error",
      "eslint-tanstack-query/no-void-query-fn": "error",
      "eslint-tanstack-query/prefer-query-options": "error",
      "eslint-tanstack-query/stable-query-client": "error",
      "eslint-tanstack-router/create-route-property-order": "error",
      "eslint-tanstack-router/route-param-names": "error",
      "node/no-process-env": "error",
    },
    overrides: [
      {
        // Strict TS rules for all first-party TS/JS code.
        // Deliberately excludes tooling/lint/** (CJS ESLint-rule bridge that requires require()).
        files: ["packages/**/*.{js,mjs,jsx,ts,tsx}", "apps/web/**/*.{js,mjs,jsx,ts,tsx}"],
        rules: {
          // Base rules redundant with tsc
          "constructor-super": "off",
          "getter-return": "off",
          "no-class-assign": "off",
          "no-const-assign": "off",
          "no-dupe-class-members": "off",
          "no-dupe-keys": "off",
          "no-func-assign": "off",
          "no-import-assign": "off",
          "no-new-native-nonconstructor": "off",
          "no-obj-calls": "off",
          "no-redeclare": "off",
          "no-setter-return": "off",
          "no-this-before-super": "off",
          "no-undef": "off",
          "no-unreachable": "off",
          "no-unsafe-negation": "off",
          "no-with": "off",
          "no-throw-literal": "off",
          "no-control-regex": "off",
          "no-useless-escape": "off",
          "prefer-promise-reject-errors": "off",
          "require-await": "off",
          // Base rules
          "no-var": "error",
          "no-else-return": "error",
          "no-param-reassign": ["error", { props: true }],
          "no-unassigned-vars": "error",
          "no-empty-pattern": "error",
          "no-unsafe-optional-chaining": "error",
          "prefer-const": "error",
          "prefer-rest-params": "error",
          "prefer-spread": "error",
          "no-array-constructor": "error",
          "no-unused-expressions": "error",
          "no-unused-vars": "error",
          "no-useless-constructor": "error",
          // TypeScript plugin (type-aware)
          "@typescript-eslint/await-thenable": "error",
          "@typescript-eslint/ban-ts-comment": [
            "error",
            {
              minimumDescriptionLength: 10,
            },
          ],
          "@typescript-eslint/no-array-delete": "error",
          "@typescript-eslint/no-base-to-string": "error",
          "@typescript-eslint/no-confusing-void-expression": "error",
          "@typescript-eslint/no-deprecated": [
            "error",
            {
              allow: ["Omit"],
            },
          ],
          "@typescript-eslint/no-duplicate-enum-values": "error",
          "@typescript-eslint/no-duplicate-type-constituents": "error",
          "@typescript-eslint/no-dynamic-delete": "error",
          "@typescript-eslint/no-empty-object-type": "error",
          "@typescript-eslint/no-explicit-any": "error",
          "@typescript-eslint/no-extra-non-null-assertion": "error",
          "@typescript-eslint/no-extraneous-class": "error",
          "@typescript-eslint/no-floating-promises": "error",
          "@typescript-eslint/no-for-in-array": "error",
          "@typescript-eslint/no-implied-eval": "error",
          "@typescript-eslint/no-invalid-void-type": "error",
          "@typescript-eslint/no-meaningless-void-operator": "error",
          "@typescript-eslint/no-misused-new": "error",
          "@typescript-eslint/no-misused-promises": "error",
          "@typescript-eslint/no-misused-spread": "error",
          "@typescript-eslint/no-mixed-enums": "error",
          "@typescript-eslint/no-namespace": "error",
          "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
          "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
          "@typescript-eslint/no-non-null-assertion": "error",
          "@typescript-eslint/no-redundant-type-constituents": "error",
          "@typescript-eslint/no-require-imports": "error",
          "@typescript-eslint/no-this-alias": "error",
          "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
          "@typescript-eslint/no-unnecessary-condition": "error",
          "@typescript-eslint/no-unnecessary-template-expression": "error",
          "@typescript-eslint/no-unnecessary-type-arguments": "error",
          "@typescript-eslint/no-unnecessary-type-assertion": "error",
          "@typescript-eslint/no-unnecessary-type-constraint": "error",
          "@typescript-eslint/no-unnecessary-type-conversion": "error",
          "@typescript-eslint/no-unnecessary-type-parameters": "error",
          "@typescript-eslint/no-unsafe-argument": "error",
          "@typescript-eslint/no-unsafe-assignment": "error",
          "@typescript-eslint/no-unsafe-call": "error",
          "@typescript-eslint/no-unsafe-declaration-merging": "error",
          "@typescript-eslint/no-unsafe-enum-comparison": "error",
          "@typescript-eslint/no-unsafe-function-type": "error",
          "@typescript-eslint/no-unsafe-member-access": "error",
          "@typescript-eslint/no-unsafe-return": "error",
          "@typescript-eslint/no-unsafe-unary-minus": "error",
          "@typescript-eslint/no-useless-default-assignment": "error",
          "@typescript-eslint/no-wrapper-object-types": "error",
          // TanStack Router's `redirect()` returns a `Redirect` (Response-like control-flow object)
          // that is meant to be thrown from beforeLoad/loaders and caught by the router.
          "@typescript-eslint/only-throw-error": [
            "error",
            {
              allow: [{ from: "package", name: "Redirect", package: "@tanstack/router-core" }],
            },
          ],
          "@typescript-eslint/prefer-as-const": "error",
          "@typescript-eslint/prefer-literal-enum-member": "error",
          "@typescript-eslint/prefer-namespace-keyword": "error",
          "@typescript-eslint/prefer-promise-reject-errors": "error",
          "@typescript-eslint/prefer-reduce-type-parameter": "error",
          "@typescript-eslint/prefer-return-this-type": "error",
          "@typescript-eslint/related-getter-setter-pairs": "error",
          "@typescript-eslint/require-await": "error",
          "@typescript-eslint/restrict-plus-operands": [
            "error",
            {
              allowAny: false,
              allowBoolean: false,
              allowNullish: false,
              allowNumberAndString: false,
              allowRegExp: false,
            },
          ],
          "@typescript-eslint/restrict-template-expressions": [
            "error",
            {
              allowAny: false,
              allowBoolean: false,
              allowNever: false,
              allowNullish: false,
              allowNumber: false,
              allowRegExp: false,
            },
          ],
          "@typescript-eslint/return-await": ["error", "error-handling-correctness-only"],
          "@typescript-eslint/triple-slash-reference": "error",
          "@typescript-eslint/unbound-method": "error",
          "@typescript-eslint/unified-signatures": "error",
          "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
        },
      },
      {
        // Non-null assertions allowed in backend packages (frontend keeps the ban)
        files: [
          "packages/auth/**/*.{js,ts}",
          "packages/db/**/*.{js,ts}",
          "packages/jobs/**/*.{js,ts}",
          "packages/mailer/**/*.{js,ts}",
          "packages/logger/**/*.{js,ts}",
        ],
        rules: {
          "@typescript-eslint/no-non-null-assertion": "off",
        },
      },
      {
        // React + a11y rules for React code (web app + shared UI package)
        files: ["apps/web/**/*.{js,jsx,ts,tsx}", "packages/ui/**/*.{js,jsx,ts,tsx}"],
        rules: {
          "react/jsx-no-target-blank": "error",
          "react/no-children-prop": "error",
          "react/no-danger-with-children": "error",
          "react/no-string-refs": "error",
          "react/no-unescaped-entities": "error",
          "react/no-unknown-property": "error",
          "react/react-in-jsx-scope": "off",
          "react/jsx-fragments": "error",
          "react/jsx-key": "error",
          "react/jsx-pascal-case": "error",
          "react/jsx-no-undef": "error",
          "react-hooks-js/rules-of-hooks": "error",
          "react-hooks-js/exhaustive-deps": "error",
          "jsx-a11y/alt-text": "error",
          "jsx-a11y/aria-props": "error",
          "jsx-a11y/aria-proptypes": "error",
          "jsx-a11y/aria-unsupported-elements": "error",
          "jsx-a11y/role-has-required-aria-props": "error",
          "jsx-a11y/role-supports-aria-props": "error",
          "jsx-a11y/no-redundant-roles": "off",
          "jsx-a11y/heading-has-content": "off",
          "jsx-a11y/media-has-caption": "off",
        },
      },

      // The ONLY files permitted to touch process.env:
      // - packages/config/src/runtime.ts is the sanctioned reader (see @repo/config/AGENTS.md)
      // - tests seed/read env vars as part of their harness
      {
        files: ["packages/config/src/runtime.ts", "**/*.test.ts", "**/*.spec.ts", "**/tests/**"],
        rules: {
          "node/no-process-env": "allow",
        },
      },
    ],
    ignorePatterns: [
      "dist",
      ".wrangler",
      ".vercel",
      ".netlify",
      ".output",
      "build/",
      "worker-configuration.d.ts",
      "scripts/",
      "**/.pnpm-store/**",
      "**/.idea/**",
      "**/.DS_Store",
    ],
  },
});
