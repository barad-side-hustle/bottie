import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { PlanTier } from "@/lib/subscriptions/plans";
import type { BillingInterval } from "@/lib/types/subscription.types";
import { generatePrivatePageMetadata } from "@/lib/seo/private-metadata";

export const metadata = generatePrivatePageMetadata("Checkout");

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string; period?: string; coupon?: string }>;
}) {
  await params;
  const search = await searchParams;

  const plan = (search.plan as PlanTier) || null;
  const period = (search.period as BillingInterval) || null;
  const coupon = search.coupon as string | null;
  return <CheckoutForm plan={plan} period={period} coupon={coupon} />;
}
