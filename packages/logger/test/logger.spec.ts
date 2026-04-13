import { describe, it, expect } from "vitest";

import { createLogger, createChild } from "../src";

describe("logger package", () => {
  it("creates a logger with basic methods", () => {
    const logger = createLogger({ level: "info", name: "test" });
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("creates a child logger", () => {
    const logger = createLogger({ name: "parent" });
    const child = createChild(logger, { requestId: "123" });
    expect(typeof child.info).toBe("function");
    expect(typeof child.child).toBe("function");
  });
});
