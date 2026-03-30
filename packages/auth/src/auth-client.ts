import { createClientOnlyFn } from "@tanstack/react-start";
import { createAuthClient } from "better-auth/react";

/**
 * Our better-auth server instance lives in the TanStack Start server,
 * so authClient is only used on the client/browser (e.g. event handlers, effects, etc).
 *
 * For server/SSR operations, prefer `auth.api` instead, and wrap in a serverFn if needed.
 */
const getAuthClient = createClientOnlyFn(() =>
  createAuthClient({
    baseURL: process.env.VITE_BASE_URL,
  }),
);

export const authClient = getAuthClient();
