import "@tanstack/react-start/server-only";
import { getZenstackClient, type DatabaseClient } from "./index";

declare global {
  // eslint-disable-next-line no-var
  var dbGlobal: DatabaseClient | undefined;
}

const db = globalThis.dbGlobal ?? getZenstackClient();

export { db };

if (process.env.NODE_ENV !== "production") {
  globalThis.dbGlobal = db;
}
