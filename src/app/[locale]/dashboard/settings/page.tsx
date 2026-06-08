import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import { getUserSettings } from "@/lib/actions/users.actions";
import { getUserStats } from "@/lib/actions/stats.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { SettingsForm } from "@/components/dashboard/settings/SettingsForm";
import { SettingsTabs } from "@/components/dashboard/settings/SettingsTabs";
import { SubscriptionInfo } from "@/components/dashboard/dashboard/SubscriptionInfo";
import { SubscriptionSuccessToast } from "@/components/dashboard/subscription/SubscriptionSuccessToast";

export const dynamic = "force-dynamic";

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SettingsPage({ params, searchParams }: SettingsPageProps) {
  const { locale } = await params;
  const { tab } = await searchParams;
  const t = await getTranslations({ locale, namespace: "dashboard.accountSettings" });

  const { userId } = await getAuthenticatedUserId();
  const [settings, stats] = await Promise.all([getUserSettings(), getUserStats(userId)]);

  const initialTab = tab === "billing" ? "billing" : "account";

  return (
    <PageContainer>
      <Suspense>
        <SubscriptionSuccessToast />
      </Suspense>

      <PageHeader title={t("title")} description={t("description")} />

      <Suspense>
        <SettingsTabs
          defaultTab={initialTab}
          accountLabel={t("accountTab")}
          billingLabel={t("billingTab")}
          account={<SettingsForm initialSettings={settings} />}
          billing={
            <SubscriptionInfo
              totalLocations={stats.totalLocations}
              paidLocations={stats.paidLocations}
              unpaidLocations={stats.unpaidLocations}
              monthlyTotal={stats.monthlyTotal}
              locationSummaries={stats.locationSummaries}
            />
          }
        />
      </Suspense>
    </PageContainer>
  );
}
