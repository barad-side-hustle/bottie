import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { AccountLocationsList } from "@/components/dashboard/home/AccountLocationsList";
import { getTranslations } from "next-intl/server";
import { getAccountsWithLocations } from "@/lib/actions/accounts.actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.home" });

  const allAccounts = await getAccountsWithLocations();
  const accountsWithLocations = allAccounts.filter((account) => account.accountLocations.length > 0);

  const hasLocations = accountsWithLocations.length > 0;

  if (!hasLocations) {
    redirect(`/${locale}/onboarding/connect-account`);
  }

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <AccountLocationsList accounts={accountsWithLocations} />
    </PageContainer>
  );
}
