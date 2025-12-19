"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { CenteredErrorState } from "@/components/ui/centered-error-state";

export default function AuthCodeError() {
  const t = useTranslations("auth.errors");
  const common = useTranslations("common");
  const auth = useTranslations("auth");
  const locale = useLocale();

  return (
    <CenteredErrorState
      variant="warning"
      title={common("errorState.title")}
      description={t("authCodeError")}
      actionLabel={auth("backToLogin")}
      actionHref={`/${locale}/login`}
    />
  );
}
