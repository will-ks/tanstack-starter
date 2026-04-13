import "@tanstack/react-start/server-only";
import { createLogger } from "@repo/logger";
import { PgBoss, type SendOptions, type WorkHandler, type WorkOptions } from "pg-boss";

const logger = createLogger({ name: "jobs" });

declare global {
  // eslint-disable-next-line no-var
  var jobsGlobal: PgBoss | undefined;
}

function createBoss(): PgBoss {
  const boss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    schema: "pgboss",
    persistWarnings: true,
    warningRetentionDays: 30,
  });

  boss.on("error", (error) => {
    logger.error({ error }, "pg-boss error");
  });

  return boss;
}

let bossInstance: PgBoss | undefined;

export async function getBoss(): Promise<PgBoss> {
  if (!bossInstance) {
    bossInstance = globalThis.jobsGlobal ?? createBoss();
    await bossInstance.start();
    logger.info("pg-boss started");
    if (process.env.NODE_ENV !== "production") {
      globalThis.jobsGlobal = bossInstance;
    }
  }
  return bossInstance;
}

export async function stopBoss(): Promise<void> {
  if (bossInstance) {
    await bossInstance.stop();
    logger.info("pg-boss stopped");
    bossInstance = undefined;
    if (process.env.NODE_ENV !== "production") {
      globalThis.jobsGlobal = undefined;
    }
  }
}

export async function send(
  queue: string,
  data?: object | null,
  options?: SendOptions,
): Promise<string | null> {
  const boss = await getBoss();
  logger.debug({ queue }, "sending job");
  return boss.send(queue, data, options);
}

export async function work<TData extends object>(
  queue: string,
  handler: WorkHandler<TData>,
  options?: WorkOptions,
): Promise<string> {
  const boss = await getBoss();
  if (options) {
    return boss.work(queue, options, handler);
  }
  return boss.work(queue, handler);
}

export type { PgBoss, WorkHandler, SendOptions, WorkOptions };
