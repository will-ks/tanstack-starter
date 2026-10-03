import { runtimeConfig } from "@repo/config/runtime";
import pino, { Logger as PinoLogger, LoggerOptions } from "pino";

export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export type Logger = PinoLogger;

export interface CreateLoggerOptions {
  level?: LogLevel;
  name?: string;
  redact?: LoggerOptions["redact"];
}

export function createLogger(opts: CreateLoggerOptions = {}): Logger {
  const level = opts.level ?? runtimeConfig.logLevel;

  const options: LoggerOptions = {
    level,
    name: opts.name,
    redact: opts.redact,
  };

  const isDev = !runtimeConfig.isProduction;

  const logger = isDev
    ? pino(
        options,
        pino.transport({
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss.l",
            ignore: "pid,hostname",
          },
        }),
      )
    : pino(options);

  return logger as Logger;
}

export function createChild(logger: Logger, bindings?: Record<string, unknown>): Logger {
  return logger.child(bindings ?? {});
}

export const defaultLogger = createLogger();

export default defaultLogger;
