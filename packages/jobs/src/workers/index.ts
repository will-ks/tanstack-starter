import { getBoss, work } from "../boss";
import { greetingWorker } from "./greeting";

const QUEUES = ["greeting"] as const;

export async function registerWorkers(): Promise<void> {
  const boss = await getBoss();

  for (const queue of QUEUES) {
    await boss.createQueue(queue);
  }

  await work("greeting", greetingWorker);

  console.log("[jobs] workers registered");
}
