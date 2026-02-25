"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { CheckoutPageLayout } from "@/components/checkout/CheckoutPageLayout";

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
    <CheckoutPageLayout showHeader={false}>
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-success" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <Loading size="md" text={t("redirecting")} description={t("redirectingDescription")} />
      </div>
    </CheckoutPageLayout>
  );
}
