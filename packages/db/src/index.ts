import "@tanstack/react-start/server-only";
import { ClientContract, ZenStackClient } from "@zenstackhq/orm";
import { PostgresDialect } from "@zenstackhq/orm/dialects/postgres";
import { Pool } from "pg";

import { schema, SchemaType } from "../zenstack/schema";

export type { JsonObject } from "@zenstackhq/orm";
export * as InputTypes from "../zenstack/input";
export * as ModelTypes from "../zenstack/models";
export { schema } from "../zenstack/schema";

export const getZenstackClient = () => {
  return new ZenStackClient(schema, {
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    }),
    log: ["error"],
  });
};

export type DatabaseClient = ClientContract<SchemaType>;

declare global {
  // eslint-disable-next-line no-var
  var dbGlobal: DatabaseClient | undefined;
}

const db: DatabaseClient = globalThis.dbGlobal ?? getZenstackClient();

export { db };

if (process.env.NODE_ENV !== "production") globalThis.dbGlobal = db;
