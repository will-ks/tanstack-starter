import type { Job } from "pg-boss";
import { describe, it, expect, vi } from "vitest";

import { greetingWorker } from "./greeting";

function makeJob(name: string, id: string): Job<{ name: string }> {
  return {
    id,
    name: "greeting",
    data: { name },
    expireInSeconds: 60,
    heartbeatSeconds: null,
    signal: new AbortController().signal,
  };
}

describe("greetingWorker", () => {
  it("should return greeted result with the name", async () => {
    const result = await greetingWorker([makeJob("World", "test-job-1")]);

    expect(result).toEqual({ greeted: true, name: "World" });
  });

  it("should log the greeting message", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await greetingWorker([makeJob("TestUser", "test-job-2")]);

    expect(logSpy).toHaveBeenCalledWith("[jobs] greeting: Hello, TestUser! (job test-job-2)");

    logSpy.mockRestore();
  });
});
