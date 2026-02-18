import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/config";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SubscriptionsRepository } from "@/lib/db/repositories/subscriptions.repository";
import { resolveLocale } from "@/lib/locale-detection";

export async function POST(_req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionsRepo = new SubscriptionsRepository();
    const subscription = await subscriptionsRepo.getByUserId(session.user.id);

    if (!subscription?.stripeCustomerId || subscription.status !== "active") {
      return NextResponse.json(
        { error: "Billing portal is only available for active paid subscriptions" },
        { status: 403 }
      );
    }

    const locale = await resolveLocale();

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/subscription`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
