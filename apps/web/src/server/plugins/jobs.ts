import { getBoss, registerWorkers, stopBoss } from "@repo/jobs";
import type { NitroAppPlugin } from "nitro/types";

export default <NitroAppPlugin>async function (nitro) {
  await getBoss();
  await registerWorkers();

  console.log("[jobs] pg-boss started");

  nitro.hooks.hook("close", async () => {
    await stopBoss();
    console.log("[jobs] pg-boss stopped");
  });
};
