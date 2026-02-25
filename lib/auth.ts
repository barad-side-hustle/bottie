import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { render } from "@react-email/render";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { db } from "@/lib/db/client";
import * as authSchema from "@/lib/db/schema/auth.schema";
import { sendUserWelcomeEmail, sendNewUserNotification } from "@/lib/utils/email-service";
import VerifyEmailTemplate from "@/lib/emails/verify-email";
import ResetPasswordEmailTemplate from "@/lib/emails/reset-password";
import { getPolar } from "@/lib/polar/config";
import { LocationSubscriptionsRepository } from "@/lib/db/repositories/location-subscriptions.repository";
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
              slug: "location-plan",
            },
          ],
          successUrl: "/checkout/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onSubscriptionCreated: async (payload) => {
            const userId = payload.data.customer?.externalId;
            if (!userId) return;

            const locationId = (payload.data.metadata as Record<string, string> | undefined)?.locationId;
            if (!locationId) {
              console.error("No locationId in subscription metadata", { subscriptionId: payload.data.id });
              return;
            }

            const repo = new LocationSubscriptionsRepository();
            await repo.create({
              userId,
              locationId,
              status: "active",
              polarSubscriptionId: payload.data.id,
            });
          },
          onSubscriptionUpdated: async (payload) => {
            const repo = new LocationSubscriptionsRepository();
            const status = payload.data.status === "active" ? "active" : "canceled";
            await repo.updateStatusByPolarSubscriptionId(payload.data.id, status);
          },
          onSubscriptionCanceled: async (payload) => {
            const repo = new LocationSubscriptionsRepository();
            await repo.cancelByPolarSubscriptionId(payload.data.id);
          },
        }),
      ],
    }),
  ],
});
