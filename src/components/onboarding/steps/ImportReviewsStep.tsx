"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { OnboardingFormPanel } from "@/components/onboarding/OnboardingFormPanel";
import { Loading } from "@/components/ui/loading";
import { AlertCircle } from "lucide-react";

interface ImportReviewsStepProps {
  accountId: string;
  locationId: string;
  onComplete: () => void;
  progressBar: React.ReactNode;
}

export function ImportReviewsStep({ accountId, locationId, onComplete, progressBar }: ImportReviewsStepProps) {
  const t = useTranslations("onboarding.importStep");
  const [error, setError] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function runImport() {
      try {
        const response = await fetch("/api/import-reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId, locationId }),
        });

        if (!response.ok || !response.body) {
          setError(true);
          return;
        }

        const reader = response.body.getReader();
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }

        onComplete();
      } catch {
        setError(true);
      }
    }

    runImport();
  }, [accountId, locationId, onComplete]);

  return (
    <OnboardingFormPanel
      title={t("title")}
      description={t("description")}
      progressBar={progressBar}
      hideNavigation={!error}
      nextButton={error ? { label: t("continue"), onClick: onComplete } : undefined}
    >
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        {error ? (
          <>
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">{t("errorDescription")}</p>
          </>
        ) : (
          <Loading size="lg" text={t("loading")} description={t("loadingDescription")} />
        )}
      </div>
    </OnboardingFormPanel>
  );
}
