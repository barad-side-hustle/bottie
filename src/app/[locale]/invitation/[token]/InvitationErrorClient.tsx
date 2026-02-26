"use client";

import { useTranslations } from "next-intl";
import { XCircle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutPageLayout } from "@/components/checkout/CheckoutPageLayout";

const errorConfig: Record<string, { icon: typeof XCircle; colorClass: string }> = {
  notFound: { icon: XCircle, colorClass: "text-destructive" },
  cancelled: { icon: XCircle, colorClass: "text-amber-500" },
  alreadyUsed: { icon: CheckCircle2, colorClass: "text-success" },
  expired: { icon: Clock, colorClass: "text-muted-foreground" },
  emailMismatch: { icon: ShieldAlert, colorClass: "text-amber-500" },
  genericError: { icon: XCircle, colorClass: "text-destructive" },
};

interface InvitationErrorClientProps {
  errorKey: string;
  locale: string;
}

export function InvitationErrorClient({ errorKey, locale }: InvitationErrorClientProps) {
  const t = useTranslations("invitation");
  const config = errorConfig[errorKey] || errorConfig.genericError;
  const Icon = config.icon;

  return (
    <CheckoutPageLayout showHeader={false}>
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div className="flex justify-center">
          <Icon className={`h-16 w-16 ${config.colorClass}`} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t(errorKey)}</p>
        </div>

        <Button variant="outline" asChild>
          <a href={`/${locale}/dashboard/home`}>{t("goToDashboard")}</a>
        </Button>
      </div>
    </CheckoutPageLayout>
  );
}
