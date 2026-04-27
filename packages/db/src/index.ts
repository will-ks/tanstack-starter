import "@tanstack/react-start/server-only";
import { createLogger } from "@repo/logger";
import { ClientContract, ZenStackClient } from "@zenstackhq/orm";
import { PostgresDialect } from "@zenstackhq/orm/dialects/postgres";
import { PolicyPlugin } from "@zenstackhq/plugin-policy";
import { Pool } from "pg";

import { schema, SchemaType } from "../zenstack/schema";

const logger = createLogger({ name: "db" });

export type { JsonObject } from "@zenstackhq/orm";
export * as InputTypes from "../zenstack/input";
export * as ModelTypes from "../zenstack/models";
export { schema } from "../zenstack/schema";

export const getZenstackClient = () => {
  logger.info("creating zenstack client");
  return new ZenStackClient(schema, {
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    }),
    log: (event) => {
      const sql = event.query.sql.replace(/\s+/g, " ").trim();
      if (event.level === "error") {
        logger.error(
          { duration: event.queryDurationMillis, sql, error: event.error },
          "query error",
        );
      } else {
        logger.debug({ duration: event.queryDurationMillis, sql }, "query");
      }
    },
  });
};

export type DatabaseClient = ClientContract<SchemaType>;

declare global {
  // eslint-disable-next-line no-var
  var authDbGlobal: DatabaseClient | undefined;
}

const authDb = (globalThis.authDbGlobal ?? getZenstackClient()).$use(new PolicyPlugin());

export { authDb };

if (process.env.NODE_ENV !== "production") {
  globalThis.authDbGlobal = authDb;
}
