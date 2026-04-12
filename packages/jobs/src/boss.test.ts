import { PgBoss } from "pg-boss";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("pg-boss", () => {
  const mockStart = vi.fn().mockResolvedValue(undefined);
  const mockStop = vi.fn().mockResolvedValue(undefined);
  const mockSend = vi.fn().mockResolvedValue("job-id-123");
  const mockWork = vi.fn().mockResolvedValue("worker-id-456");
  const mockOn = vi.fn();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockPgBoss = vi.fn(function (this: any) {
    this.start = mockStart;
    this.stop = mockStop;
    this.send = mockSend;
    this.work = mockWork;
    this.on = mockOn;
  });

  return {
    PgBoss: MockPgBoss,
  };
});

// Must import after mock setup
const MockedPgBoss = vi.mocked(PgBoss);

// Reset module state between tests by re-importing
describe("boss", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete globalThis.jobsGlobal;
    process.env.DATABASE_URL = "postgres://test:test@localhost:5432/testdb";
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    vi.resetModules();
    delete globalThis.jobsGlobal;
  });

  describe("getBoss", () => {
    it("should create a PgBoss instance with DATABASE_URL", async () => {
      const { getBoss } = await import("./boss");
      await getBoss();

      expect(MockedPgBoss).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionString: "postgres://test:test@localhost:5432/testdb",
          schema: "pgboss",
          persistWarnings: true,
        }),
      );
    });

    it("should call start on the boss instance", async () => {
      const { getBoss } = await import("./boss");
      const boss = await getBoss();

      expect(boss.start).toHaveBeenCalled();
    });

    it("should return the same instance on subsequent calls", async () => {
      const { getBoss } = await import("./boss");
      const boss1 = await getBoss();
      const boss2 = await getBoss();

      expect(boss1).toBe(boss2);
      expect(MockedPgBoss).toHaveBeenCalledTimes(1);
    });

    it("should cache instance on globalThis in non-production", async () => {
      const { getBoss } = await import("./boss");
      await getBoss();

      expect(globalThis.jobsGlobal).toBeDefined();
    });
  });

  describe("stopBoss", () => {
    it("should stop the boss instance", async () => {
      const { getBoss, stopBoss } = await import("./boss");
      await getBoss();
      await stopBoss();

      // After stop, getBoss should create a new instance
      const mockCalls = MockedPgBoss.mock.calls.length;
      const { getBoss: freshGetBoss } = await import("./boss");
      await freshGetBoss();

      expect(MockedPgBoss.mock.calls.length).toBeGreaterThan(mockCalls);
    });

    it("should clear globalThis cache on stop", async () => {
      const { getBoss, stopBoss } = await import("./boss");
      await getBoss();
      expect(globalThis.jobsGlobal).toBeDefined();

      await stopBoss();
      expect(globalThis.jobsGlobal).toBeUndefined();
    });

    it("should be a no-op when no instance exists", async () => {
      const { stopBoss } = await import("./boss");
      await expect(stopBoss()).resolves.toBeUndefined();
    });
  });

  describe("send", () => {
    it("should delegate to boss.send", async () => {
      const { send } = await import("./boss");
      const jobId = await send("test-queue", { foo: "bar" });

      const { getBoss } = await import("./boss");
      const boss = await getBoss();

      expect(boss.send).toHaveBeenCalledWith("test-queue", { foo: "bar" }, undefined);
      expect(jobId).toBe("job-id-123");
    });
  });

  describe("work", () => {
    it("should register a worker without options", async () => {
      const { work } = await import("./boss");
      const handler = async () => undefined;
      const workerId = await work("test-queue", handler);

      const { getBoss } = await import("./boss");
      const boss = await getBoss();

      expect(boss.work).toHaveBeenCalledWith("test-queue", handler);
      expect(workerId).toBe("worker-id-456");
    });

    it("should pass options when provided", async () => {
      const { work } = await import("./boss");
      const handler = async () => undefined;
      const options = { batchSize: 5 };
      await work("test-queue", handler, options);

      const { getBoss } = await import("./boss");
      const boss = await getBoss();

      expect(boss.work).toHaveBeenCalledWith("test-queue", options, handler);
    });
  });
});
