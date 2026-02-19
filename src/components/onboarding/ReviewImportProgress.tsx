"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { CircularProgress } from "@/components/ui/circular-progress";

interface ReviewImportProgressProps {
  accountId: string;
  locationId: string;
}

type ImportPhase = "connecting" | "importing" | "complete" | "error";

const TIMEOUT_MS = 120_000;
const REDIRECT_DELAY_MS = 2500;

export function ReviewImportProgress({ accountId, locationId }: ReviewImportProgressProps) {
  const router = useRouter();
  const t = useTranslations("onboarding.importProgress");

  const [phase, setPhase] = useState<ImportPhase>("connecting");
  const [total, setTotal] = useState(0);
  const [imported, setImported] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiFired = useRef(false);

  const progress = total > 0 ? Math.round((imported / total) * 100) : 0;

  const fireConfetti = useCallback(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;

    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    confetti({ ...defaults, particleCount: 50, origin: { x: 0.3, y: 0.6 } });
    confetti({ ...defaults, particleCount: 50, origin: { x: 0.7, y: 0.6 } });
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 30, origin: { x: 0.5, y: 0.4 } });
    }, 250);
  }, []);

  const cleanup = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleComplete = useCallback(
    (finalImported?: number) => {
      cleanup();
      if (finalImported !== undefined) setImported(finalImported);
      setPhase("complete");
      fireConfetti();

      setTimeout(() => {
        router.push("/dashboard/home");
      }, REDIRECT_DELAY_MS);
    },
    [cleanup, fireConfetti, router]
  );

  useEffect(() => {
    const abortController = new AbortController();
    abortRef.current = abortController;

    timeoutRef.current = setTimeout(() => {
      if (!confettiFired.current) {
        handleComplete();
      }
    }, TIMEOUT_MS);

    async function startImport() {
      try {
        const response = await fetch("/api/import-reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId, locationId }),
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          setErrorMessage(t("errorDescription"));
          setPhase("error");
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const dataLine = line.replace(/^data: /, "").trim();
            if (!dataLine) continue;

            try {
              const event = JSON.parse(dataLine);

              switch (event.type) {
                case "total":
                  setTotal(event.total);
                  if (event.total === 0) {
                    handleComplete(0);
                    return;
                  }
                  setPhase("importing");
                  break;
                case "progress":
                  setImported(event.imported);
                  break;
                case "complete":
                  handleComplete(event.imported);
                  return;
                case "error":
                  setErrorMessage(event.message || t("errorDescription"));
                  setPhase("error");
                  return;
              }
            } catch {}
          }
        }

        if (!confettiFired.current) {
          handleComplete();
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setErrorMessage(t("errorDescription"));
        setPhase("error");
      }
    }

    startImport();

    return () => {
      cleanup();
    };
  }, [accountId, locationId, handleComplete, cleanup, t]);

  if (phase === "error") {
    return (
      <OnboardingCard
        title={t("title")}
        description={t("errorDescription")}
        nextButton={{
          label: t("skipToDashboard"),
          onClick: () => router.push("/dashboard/home"),
        }}
      >
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      </OnboardingCard>
    );
  }

  return (
    <OnboardingCard
      title={phase === "complete" ? t("completeTitle") : t("title")}
      description={phase === "complete" ? t("completeDescription") : t("description")}
      hideNavigation
    >
      <div className="flex flex-col items-center gap-6 py-8">
        <CircularProgress value={phase === "complete" ? 100 : progress} size={140} strokeWidth={10} />

        <div className="text-center space-y-1">
          {phase === "connecting" && <p className="text-sm text-muted-foreground">{t("preparingImport")}</p>}
          {phase === "importing" && (
            <>
              <p className="text-sm font-medium">{t("importingCount", { imported, total })}</p>
              <p className="text-xs text-muted-foreground">{t("pleaseWait")}</p>
            </>
          )}
          {phase === "complete" && (
            <>
              <p className="text-sm font-medium text-green-600">{t("importComplete", { count: imported })}</p>
              <p className="text-xs text-muted-foreground">{t("redirecting")}</p>
            </>
          )}
        </div>
      </div>
    </OnboardingCard>
  );
}
