import { createLogger } from "@repo/logger";

import type { WorkHandler } from "../boss";

const logger = createLogger({ name: "jobs:greeting" });

export interface GreetingPayload {
  name: string;
}

export const greetingWorker: WorkHandler<GreetingPayload> = ([job]) => {
  const { name } = job.data;

  logger.info({ jobId: job.id, name }, "greeting processed");

  return Promise.resolve({ greeted: true, name });
};
