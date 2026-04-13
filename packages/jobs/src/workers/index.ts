import { createLogger } from "@repo/logger";

import { getBoss, work } from "../boss";
import { greetingWorker } from "./greeting";

const logger = createLogger({ name: "jobs:workers" });

const QUEUES = ["greeting"] as const;

export async function registerWorkers(): Promise<void> {
  const boss = await getBoss();

  for (const queue of QUEUES) {
    await boss.createQueue(queue);
  }

  await work("greeting", greetingWorker);

  logger.info({ queues: QUEUES }, "workers registered");
}
