import "@tanstack/react-start/server-only";
import { db } from "@repo/db";
import { mailer } from "@repo/mailer/index";
import { zenstackAdapter } from "@zenstackhq/better-auth";
import { betterAuth } from "better-auth/minimal";
import { emailOTP, organization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = betterAuth({
  baseURL: process.env.VITE_BASE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  telemetry: {
    enabled: false,
  },
  database: zenstackAdapter(db, {
    provider: "postgresql",
  }),

  plugins: [
    tanstackStartCookies(),
    organization(),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await mailer.sendOtpLink({ to: email, otp });
      },
    }),
  ],

  // https://www.better-auth.com/docs/concepts/session-management#session-caching
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  // https://www.better-auth.com/docs/concepts/oauth
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Auto-create a personal organization for each new user and set it as
  // the active organization on every new session.
  databaseHooks: {
    user: {},
    session: {
      create: {
        before: async (
          session,
        ): Promise<{ data: typeof session & { activeOrganizationId?: string } }> => {
          const memberships = await db.member.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: "asc" },
            take: 1,
          });

          const firstOrg = memberships[0];

          if (firstOrg) {
            return {
              data: {
                ...session,
                activeOrganizationId: firstOrg.organizationId,
              },
            };
          }

          // First sign-up — no org yet, create one
          const org = await auth.api.createOrganization({
            body: {
              name: `Personal`,
              slug: `personal-${session.userId}`,
              userId: session.userId,
            },
          });

          return {
            data: {
              ...session,
              activeOrganizationId: org.id,
            },
          };
        },
      },
    },
  },
});
