"use strict";

/**
 * Rule: icon-import-suffix
 * ------------------------
 * Enforces the icon-import naming conventions from AGENTS.md:
 *   - `lucide-react` imports must end with `Icon` (e.g. `Loader2Icon`).
 *   - `@icons-pack/react-simple-icons` imports must start with `Si` (e.g. `SiGithub`).
 *
 * Enforces: AGENTS.md (root) — "Use `lucide-react` for UI icons (use `Icon`
 * suffix, e.g. `Loader2Icon`); for brand icons use
 * `@icons-pack/react-simple-icons` (e.g. `SiGithub`)".
 *
 * Reason: Consistent icon naming makes them greppable, distinguishes icons from
 * regular components, and makes accidental swaps between icon libraries
 * immediately visible in code review.
 *
 * Notes:
 *   - Default-import specifiers (`import X from "lucide-react"`) are skipped —
 *     `lucide-react` is meant to be used via named exports.
 *   - Namespace imports (`import * as X`) are skipped for the same reason.
 *   - Re-exports are skipped (only consumption sites matter).
 *
 * Opt out: `// eslint-local/icon-import-suffix: off` on the line.
 */

const LUCIDE = "lucide-react";
const SIMPLE_ICONS = "@icons-pack/react-simple-icons";

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce icon naming: lucide-react imports end with `Icon`, react-simple-icons start with `Si`",
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        const specifiers = node.specifiers || [];

        if (source === LUCIDE) {
          for (const spec of specifiers) {
            if (spec.type !== "ImportSpecifier") continue;
            const name = spec.imported.name;
            if (!name.endsWith("Icon")) {
              context.report({
                node: spec,
                message:
                  "`{{name}}` from `lucide-react` must be imported with an `Icon` suffix (e.g. `{{base}}Icon`). Use the `Icon`-suffixed export to keep icons greppable and distinct from regular components.",
                data: { name, base: name },
              });
            }
          }
          return;
        }

        if (source === SIMPLE_ICONS) {
          for (const spec of specifiers) {
            if (spec.type !== "ImportSpecifier") continue;
            const name = spec.imported.name;
            if (!name.startsWith("Si")) {
              context.report({
                node: spec,
                message:
                  "`{{name}}` from `@icons-pack/react-simple-icons` must be imported with a `Si` prefix (e.g. `Si{{base}}`). Brand icons are differentiated from generic UI icons by the `Si` prefix.",
                data: { name, base: name },
              });
            }
          }
        }
      },
    };
  },
};
