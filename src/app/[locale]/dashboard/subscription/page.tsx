import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import { getUserStats } from "@/lib/actions/stats.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { SubscriptionInfo } from "@/components/dashboard/dashboard/SubscriptionInfo";
import { UpgradeButton } from "@/components/dashboard/subscription/UpgradeButton";
import { SubscriptionSuccessToast } from "@/components/dashboard/subscription/SubscriptionSuccessToast";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.subscription" });

  const stats = await getUserStats(userId);

  return (
    <PageContainer>
      <Suspense>
        <SubscriptionSuccessToast />
      </Suspense>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6">
        <SubscriptionInfo
          limits={stats.limits}
          currentReviews={stats.reviews}
          reviewsPercent={stats.reviewsPercent}
          hasPaidSubscription={stats.hasPaidSubscription}
        />

        <div className="flex gap-3 flex-wrap">{!stats.hasPaidSubscription && <UpgradeButton />}</div>
      </div>
    </PageContainer>
  );
}
