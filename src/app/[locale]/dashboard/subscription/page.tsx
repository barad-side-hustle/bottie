import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SubscriptionRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const { success } = await searchParams;

  const query = new URLSearchParams({ tab: "billing" });
  if (success) query.set("success", String(success));

  redirect(`/${locale}/dashboard/settings?${query.toString()}`);
}
