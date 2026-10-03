import "@tanstack/react-start/server-only";
import { getAsserted } from "@repo/utils";

function requireEnv(name: string): string {
  return getAsserted(process.env[name], { name: `process.env.${name}` });
}

function parseLogLevel(value: string | undefined) {
  switch (value) {
    case "fatal":
    case "error":
    case "warn":
    case "info":
    case "debug":
    case "trace":
      return value;
    case undefined:
      return "info";
    default:
      throw new Error(
        `Invalid LOG_LEVEL "${value}". Expected one of: fatal, error, warn, info, debug, trace.`,
      );
  }
}

export const runtimeConfig = {
  get betterAuthSecret() {
    return requireEnv("BETTER_AUTH_SECRET");
  },
  get databaseUrl() {
    return requireEnv("DATABASE_URL");
  },
  get baseUrl() {
    return requireEnv("VITE_BASE_URL");
  },
  get polarAccessToken() {
    return requireEnv("POLAR_ACCESS_TOKEN");
  },
  get polarWebhookSecret() {
    return requireEnv("POLAR_WEBHOOK_SECRET");
  },
  get githubClientId() {
    return requireEnv("GITHUB_CLIENT_ID");
  },
  get githubClientSecret() {
    return requireEnv("GITHUB_CLIENT_SECRET");
  },
  get googleClientId() {
    return requireEnv("GOOGLE_CLIENT_ID");
  },
  get googleClientSecret() {
    return requireEnv("GOOGLE_CLIENT_SECRET");
  },
  get polarServer() {
    return process.env.POLAR_SERVER === "production" ? "production" : "sandbox";
  },
  get logLevel() {
    return parseLogLevel(process.env.LOG_LEVEL);
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
};

/**
 * Forces every getter to be evaluated so a misconfigured deployment crashes
 * at boot instead of at the first request that needs the missing value.
 */
export function assertRuntimeConfig(): void {
  Object.values(runtimeConfig);
}
