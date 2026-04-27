"use strict";

const FORBIDDEN = "@repo/db/internal";

module.exports = {
  rules: {
    "no-db-internal": {
      meta: {
        type: "problem",
        docs: {
          description: `Disallow importing from '${FORBIDDEN}' in the web app`,
        },
      },
      create(context) {
        const filePath = context.filename;
        if (!filePath || !filePath.includes("apps/web/")) return {};

        function checkSource(node, source) {
          if (source === FORBIDDEN || source.startsWith(FORBIDDEN + "/")) {
            context.report({
              node,
              message: `Importing from '${FORBIDDEN}' is forbidden in the web app. Use 'authDb' from '@repo/db' instead.`,
            });
          }
        }

        return {
          ImportDeclaration(node) {
            checkSource(node, node.source.value);
          },
          CallExpression(node) {
            if (
              node.callee.type === "Identifier" &&
              node.callee.name === "require" &&
              node.arguments.length === 1 &&
              node.arguments[0].type === "Literal" &&
              typeof node.arguments[0].value === "string"
            ) {
              checkSource(node, node.arguments[0].value);
            }
          },
        };
      },
    },
  },
};
