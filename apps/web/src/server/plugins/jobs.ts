import { assertRuntimeConfig } from "@repo/config/runtime";
import { getBoss, registerWorkers, stopBoss } from "@repo/jobs";
import { createLogger } from "@repo/logger";
import type { NitroAppPlugin } from "nitro/types";

const logger = createLogger({ name: "web:plugins:jobs" });

export default <NitroAppPlugin>async function (nitro) {
  // Fail fast: crash the server on boot if any required env var is missing,
  // instead of surfacing misconfiguration on the first request that needs it.
  assertRuntimeConfig();

  await getBoss();
  await registerWorkers();

  logger.info("pg-boss initialized");

  nitro.hooks.hook("close", async () => {
    await stopBoss();
    logger.info("pg-boss shut down");
  });
};
