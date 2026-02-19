"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";
import { Loading } from "@/components/ui/loading";

interface CheckoutSuccessClientProps {
  locale: string;
}

export function CheckoutSuccessClient({ locale }: CheckoutSuccessClientProps) {
  const router = useRouter();
  const t = useTranslations("checkout.success");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/${locale}/dashboard/subscription?success=true`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [locale, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <DashboardCard className="w-full max-w-md">
        <DashboardCardContent className="space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-success" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loading size="md" text={t("redirecting")} description={t("redirectingDescription")} />
          </div>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
