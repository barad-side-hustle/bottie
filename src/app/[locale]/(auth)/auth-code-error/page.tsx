"use client";

import { useTranslations } from "next-intl";
import { CenteredErrorState } from "@/components/ui/centered-error-state";

export default function AuthCodeError() {
  const t = useTranslations("auth.errors");
  const common = useTranslations("common");
  const auth = useTranslations("auth");

  return (
    <CenteredErrorState
      variant="warning"
      title={common("errorState.title")}
      description={t("authCodeError")}
      actionLabel={auth("backToLogin")}
      actionHref="/login"
    />
  );
}
