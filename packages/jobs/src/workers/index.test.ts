import { describe, it, expect, vi, beforeEach } from "vitest";

import { greetingWorker } from "./greeting";

// Mock boss module so registerWorkers doesn't need a real DB
vi.mock("../boss", () => ({
  getBoss: vi.fn(),
  work: vi.fn(),
}));

import { getBoss, work } from "../boss";

const mockCreateQueue = vi.fn();
const mockGetBoss = vi.mocked(getBoss);
const mockWork = vi.mocked(work);

describe("registerWorkers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBoss.mockResolvedValue({
      createQueue: mockCreateQueue,
    } as never);
  });

  it("should create the greeting queue", async () => {
    const { registerWorkers } = await import("./index");

    await registerWorkers();

    expect(mockCreateQueue).toHaveBeenCalledWith("greeting");
  });

  it("should register the greeting worker", async () => {
    const { registerWorkers } = await import("./index");

    await registerWorkers();

    expect(mockWork).toHaveBeenCalledWith("greeting", greetingWorker);
  });

  it("should log after registration", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { registerWorkers } = await import("./index");

    await registerWorkers();

    expect(logSpy).toHaveBeenCalledWith("[jobs] workers registered");

    logSpy.mockRestore();
  });
});
