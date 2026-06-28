"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getPolar } from "@/lib/polar/config";
import { env } from "@/lib/env";

export async function createLocationCheckout(locationId: string): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const checkout = await getPolar().checkouts.create({
    products: [env.POLAR_PRODUCT_ID],
    externalCustomerId: `${session.user.id}:${locationId}`,
    customerEmail: session.user.email,
    customerName: session.user.name ?? undefined,
    successUrl: `${env.NEXT_PUBLIC_APP_URL}/checkout/success?checkout_id={CHECKOUT_ID}`,
    metadata: { userId: session.user.id, locationId },
  });

  return checkout.url;
}
