import "@tanstack/react-start/server-only";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { runtimeConfig } from "@repo/config/runtime";
import { db } from "@repo/db/internal";
import { createLogger } from "@repo/logger";
import { mailer } from "@repo/mailer/index";
import { zenstackAdapter } from "@zenstackhq/better-auth";
import { betterAuth } from "better-auth/minimal";
import { emailOTP, organization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const logger = createLogger({ name: "auth" });

export const polarClient = new Polar({
  accessToken: runtimeConfig.polarAccessToken,
  server: runtimeConfig.polarServer,
});

export const auth = betterAuth({
  baseURL: runtimeConfig.baseUrl,
  secret: runtimeConfig.betterAuthSecret,
  logger: {
    log: (level, message, ...args) => {
      logger[level]({ args }, message);
    },
  },
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
        logger.info({ email }, "sending verification otp");
        await mailer.sendOtpLink({ to: email, otp });
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: false,
      use: [
        checkout({
          successUrl: `${runtimeConfig.baseUrl}/app/billing?checkout=success`,
          authenticatedUsersOnly: true,
        }),
        portal({
          returnUrl: `${runtimeConfig.baseUrl}/app/billing`,
        }),
        webhooks({
          secret: runtimeConfig.polarWebhookSecret,
          onSubscriptionCreated: async (payload) => {
            logger.info({ payload }, "polar subscription created");
          },
          onSubscriptionActive: async (payload) => {
            logger.info({ payload }, "polar subscription active");
          },
          onSubscriptionCanceled: async (payload) => {
            logger.info({ payload }, "polar subscription canceled");
          },
          onSubscriptionRevoked: async (payload) => {
            logger.info({ payload }, "polar subscription revoked");
          },
        }),
      ],
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
      clientId: runtimeConfig.githubClientId,
      clientSecret: runtimeConfig.githubClientSecret,
    },
    google: {
      clientId: runtimeConfig.googleClientId,
      clientSecret: runtimeConfig.googleClientSecret,
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
            logger.debug(
              { userId: session.userId, organizationId: firstOrg.organizationId },
              "session attaching existing org",
            );
            return {
              data: {
                ...session,
                activeOrganizationId: firstOrg.organizationId,
              },
            };
          }

          const plan = await db.plan.findUniqueOrThrow({ where: { slug: "free" } });

          const org = await db.organization.create({
            data: {
              name: "Personal",
              slug: `personal-${session.userId}`,
              planId: plan.id,
              members: {
                create: { userId: session.userId, role: "owner" },
              },
            },
          });

          logger.info(
            { userId: session.userId, organizationId: org.id },
            "created personal organization for new user",
          );

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
