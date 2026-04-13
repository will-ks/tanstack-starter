import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/jobs", () => ({
  getBoss: vi.fn().mockResolvedValue({}),
  registerWorkers: vi.fn().mockResolvedValue(undefined),
  stopBoss: vi.fn().mockResolvedValue(undefined),
}));

import { getBoss, registerWorkers, stopBoss } from "@repo/jobs";

const mockGetBoss = vi.mocked(getBoss);
const mockRegisterWorkers = vi.mocked(registerWorkers);
const mockStopBoss = vi.mocked(stopBoss);

describe("Nitro jobs plugin", () => {
  const mockHooks = {
    hook: vi.fn(),
  };

  const mockNitro = {
    hooks: mockHooks,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize pg-boss and register workers on startup", async () => {
    const { default: plugin } = await import("./jobs");

    plugin(mockNitro as never);

    await vi.waitFor(() => {
      expect(mockGetBoss).toHaveBeenCalledOnce();
    });
    expect(mockRegisterWorkers).toHaveBeenCalledOnce();
    expect(mockRegisterWorkers).toHaveBeenCalledAfter(mockGetBoss);
  });

  it("should register a close hook for graceful shutdown", async () => {
    const { default: plugin } = await import("./jobs");

    plugin(mockNitro as never);

    await vi.waitFor(() => {
      expect(mockHooks.hook).toHaveBeenCalledWith("close", expect.any(Function));
    });
  });

  it("should call stopBoss when the close hook fires", async () => {
    const { default: plugin } = await import("./jobs");

    plugin(mockNitro as never);

    await vi.waitFor(() => {
      expect(mockHooks.hook).toHaveBeenCalled();
    });

    const closeHandler = mockHooks.hook.mock.calls.find(([event]) => event === "close")?.[1] as (
      ...args: unknown[]
    ) => Promise<void>;

    expect(closeHandler).toBeDefined();
    await closeHandler();

    expect(mockStopBoss).toHaveBeenCalledOnce();
  });

  it("should not call stopBoss until close hook fires", async () => {
    const { default: plugin } = await import("./jobs");

    plugin(mockNitro as never);

    await vi.waitFor(() => {
      expect(mockGetBoss).toHaveBeenCalled();
    });

    expect(mockStopBoss).not.toHaveBeenCalled();
  });
});
