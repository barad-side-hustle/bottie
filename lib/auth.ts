import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { render } from "@react-email/render";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { db } from "@/lib/db/client";
import * as authSchema from "@/lib/db/schema/auth.schema";
import { sendUserWelcomeEmail, sendNewUserNotification } from "@/lib/utils/email-service";
import VerifyEmailTemplate from "@/lib/emails/verify-email";
import ResetPasswordEmailTemplate from "@/lib/emails/reset-password";
import { getPolar } from "@/lib/polar/config";
import { SubscriptionsRepository } from "@/lib/db/repositories/subscriptions.repository";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = await render(ResetPasswordEmailTemplate({ userName: user.name, url }));
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Bottie <noreply@bottie.ai>",
        to: user.email,
        subject: "Reset your password",
        html,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = await render(VerifyEmailTemplate({ userName: user.name, url }));
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Bottie <noreply@bottie.ai>",
        to: user.email,
        subject: "Verify your email address",
        html,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          sendUserWelcomeEmail({ userEmail: user.email, userName: user.name, userId: user.id }).catch(console.error);
          sendNewUserNotification({
            userEmail: user.email,
            userName: user.name,
            userId: user.id,
            signupTimestamp: new Date(),
          }).catch(console.error);
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  plugins: [
    nextCookies(),
    polar({
      client: getPolar(),
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: env.POLAR_PRODUCT_ID,
              slug: "pay-as-you-go",
            },
          ],
          successUrl: "/checkout/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onSubscriptionCreated: async (payload) => {
            const userId = payload.data.customer?.externalId;
            if (!userId) return;

            const repo = new SubscriptionsRepository();
            await repo.upsert(userId, {
              polarCustomerId: payload.data.customerId,
              polarSubscriptionId: payload.data.id,
              status: payload.data.status,
            });
          },
          onSubscriptionUpdated: async (payload) => {
            const userId = payload.data.customer?.externalId;
            if (!userId) return;

            const repo = new SubscriptionsRepository();
            const existing = await repo.getByUserId(userId);
            if (existing) {
              await repo.update(existing.id, {
                polarSubscriptionId: payload.data.id,
                status: payload.data.status,
              });
            }
          },
          onSubscriptionCanceled: async (payload) => {
            const userId = payload.data.customer?.externalId;
            if (!userId) return;

            const repo = new SubscriptionsRepository();
            const existing = await repo.getByUserId(userId);
            if (existing) {
              await repo.update(existing.id, {
                status: "canceled",
              });
            }
          },
        }),
      ],
    }),
  ],
});
