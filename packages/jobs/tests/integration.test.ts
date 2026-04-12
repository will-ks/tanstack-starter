import { PgBoss } from "pg-boss";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const skipIntegration = !TEST_DATABASE_URL;

describe.skipIf(skipIntegration)("jobs integration", () => {
  let boss: PgBoss;

  beforeAll(async () => {
    boss = new PgBoss({
      connectionString: TEST_DATABASE_URL,
      schema: "pgboss_integration_test",
    });
    boss.on("error", (error) => {
      console.error("[integration test] pg-boss error:", error);
    });
    await boss.start();
  });

  afterAll(async () => {
    await boss.stop();
  });

  it("should create a queue and process a greeting job", async () => {
    await boss.createQueue("greeting-integration");

    const greetingWorker = async (jobs: { id: string; data: { name: string } }[]) => {
      return { greeted: true, name: jobs[0].data.name };
    };

    await boss.work("greeting-integration", greetingWorker);

    const jobId = await boss.send("greeting-integration", { name: "Integration" });
    expect(jobId).toBeTruthy();

    const result = await waitForJobCompletion(boss, "greeting-integration", jobId!, 10000);
    expect(result).toBeDefined();
    expect(result!.output).toEqual({ greeted: true, name: "Integration" });
  });

  it("should handle job failures gracefully", async () => {
    await boss.createQueue("failing-integration");

    let callCount = 0;
    await boss.work("failing-integration", async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error("intentional test failure");
      }
      return { success: true };
    });

    await boss.send(
      "failing-integration",
      { attempt: 1 },
      {
        retryLimit: 1,
        retryDelay: 1,
      },
    );

    await sleep(5000);

    expect(callCount).toBeGreaterThanOrEqual(1);
  });
});

async function waitForJobCompletion(
  boss: PgBoss,
  queue: string,
  jobId: string,
  timeoutMs: number,
): Promise<{ output: object } | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const jobs = await boss.findJobs(queue, { id: jobId });
    const completed = jobs.find((j) => j.state === "completed");
    if (completed) {
      return { output: completed.output };
    }
    await sleep(500);
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
