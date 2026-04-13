import { createLogger } from "@repo/logger";

import type { WorkHandler } from "../boss";

const logger = createLogger({ name: "jobs:greeting" });

export interface GreetingPayload {
  name: string;
}

export const greetingWorker: WorkHandler<GreetingPayload> = async ([job]) => {
  const { name } = job.data;

  logger.info({ jobId: job.id, name }, "greeting processed");

  return { greeted: true, name };
};
