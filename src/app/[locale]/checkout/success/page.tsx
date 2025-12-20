import { CheckoutSuccessClient } from "./CheckoutSuccessClient";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id } = await searchParams;

  return <CheckoutSuccessClient locale={locale} sessionId={session_id} />;
}
