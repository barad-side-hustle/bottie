"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function OnboardingError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-soft)" }}>
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <h2 className="text-xl font-semibold">{t("error")}</h2>
        <Button onClick={reset}>{t("tryAgain")}</Button>
      </div>
    </div>
  );
}
