"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { OnboardingFormPanel } from "@/components/onboarding/OnboardingFormPanel";
import { Skeleton } from "@/components/ui/skeleton";
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
      {error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <AlertCircle className="h-6 w-6 text-ink-3" />
          <p className="text-base leading-relaxed text-ink-2 max-w-sm">{t("errorDescription")}</p>
        </div>
      ) : (
        <div className="space-y-6" aria-busy="true">
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">{t("loading")}</p>
            <p className="text-sm text-ink-2">{t("loadingDescription")}</p>
          </div>
          <ul className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="rounded-lg border border-hairline bg-surface p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </OnboardingFormPanel>
  );
}
