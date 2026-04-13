import { getBoss, registerWorkers, stopBoss } from "@repo/jobs";
import { createLogger } from "@repo/logger";
import type { NitroAppPlugin } from "nitro/types";

const logger = createLogger({ name: "web:plugins:jobs" });

export default <NitroAppPlugin>async function (nitro) {
  await getBoss();
  await registerWorkers();

  logger.info("pg-boss initialized");

  nitro.hooks.hook("close", async () => {
    await stopBoss();
    logger.info("pg-boss shut down");
  });
};
