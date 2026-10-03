import { polarClient } from "@polar-sh/better-auth/client";
import { buildConfig } from "@repo/config/build";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * https://better-auth.com/docs/concepts/client
 *
 * Our better-auth server instance lives in the TanStack Start server,
 * so authClient should only be used on the client (event handlers, effects, etc).
 *
 * For server/SSR operations, prefer `auth.api` instead, and wrap in a serverFn if needed.
 */
export const authClient = createAuthClient({
  baseURL: buildConfig.baseUrl,
  plugins: [organizationClient(), emailOTPClient(), polarClient()],
});
