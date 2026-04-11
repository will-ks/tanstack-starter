import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";

import { type AuthContext, _getUser } from "./functions";

// https://tanstack.com/start/latest/docs/framework/react/guide/middleware

export { type AuthContext };

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const authContext = await _getUser();

  if (!authContext.user) {
    setResponseStatus(401);
    throw new Error("Unauthorized");
  }

  return next({
    context: {
      user: authContext.user,
      organizationId: authContext.organizationId,
      organizationRole: authContext.organizationRole,
    },
  });
});

export const freshAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const authContext = await _getUser({
    disableCookieCache: true,
  });

  if (!authContext.user) {
    setResponseStatus(401);
    throw new Error("Unauthorized");
  }

  return next({
    context: {
      user: authContext.user,
      organizationId: authContext.organizationId,
      organizationRole: authContext.organizationRole,
    },
  });
});
