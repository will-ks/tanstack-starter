import { db } from "@repo/db";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

import { auth } from "../auth";

export interface AuthContext {
  user: NonNullable<Awaited<ReturnType<typeof _getUser>>["user"]>;
  organizationId: string | null;
  organizationRole: string | null;
  plan: NonNullable<Awaited<ReturnType<typeof _getUser>>["plan"]>;
}

export const $getUser = createServerFn({ method: "GET" }).handler(async () => {
  return _getUser();
});

interface GetUserServerQuery {
  disableCookieCache?: boolean | undefined;
  disableRefresh?: boolean | undefined;
}

export const _getUser = createServerOnlyFn(async (query?: GetUserServerQuery) => {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
    query,
    returnHeaders: true,
  });

  const cookies = session.headers?.getSetCookie();
  if (cookies?.length) {
    setResponseHeader("Set-Cookie", cookies);
  }

  const user = session.response?.user || null;
  const organizationId = session.response?.session?.activeOrganizationId ?? null;

  let organizationRole: string | null = null;
  let plan: { id: string; slug: string; name: string } | null = null;
  if (user && organizationId) {
    const [org, dbOrg] = await Promise.all([
      auth.api.getFullOrganization({
        headers: getRequest().headers,
        query: { organizationId },
      }),
      db.organization.findUnique({
        where: { id: organizationId },
        include: { plan: { select: { id: true, slug: true, name: true } } },
      }),
    ]);
    const myMember = org?.members?.find((m) => m.userId === user.id);
    organizationRole = myMember?.role ?? null;
    plan = dbOrg?.plan ?? null;
  }

  return { user, organizationId, organizationRole, plan };
});
