"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Button } from "@/components/ui/button";

interface CompletionCelebrationProps {
  accountId: string;
  locationId: string;
}

type ImportPhase = "connecting" | "importing" | "complete" | "error";

const TIMEOUT_MS = 120_000;
const REDIRECT_DELAY_MS = 2500;

export function CompletionCelebration({ accountId, locationId }: CompletionCelebrationProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-onboarding-fade-in"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div className="absolute top-1/4 start-1/4 h-64 w-64 rounded-full bg-pastel-lavender/20 blur-3xl" />
      <div className="absolute bottom-1/3 end-1/4 h-48 w-48 rounded-full bg-pastel-sky/20 blur-3xl" />
      <div className="absolute top-1/2 end-1/3 h-56 w-56 rounded-full bg-pastel-peach/15 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md mx-auto px-4 text-center">
        {phase === "error" ? (
          <>
            <h2 className="text-2xl font-semibold">{t("title")}</h2>
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button onClick={() => router.push("/dashboard/home")} className="shadow-primary">
              {t("skipToDashboard")}
            </Button>
          </>
        ) : (
          <>
            <CircularProgress value={phase === "complete" ? 100 : progress} size={140} strokeWidth={10} />

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{phase === "complete" ? t("completeTitle") : t("title")}</h2>
              <p className="text-sm text-muted-foreground">
                {phase === "complete" ? t("completeDescription") : t("description")}
              </p>
            </div>

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
                  <p className="text-sm font-medium text-success">{t("importComplete", { count: imported })}</p>
                  <p className="text-xs text-muted-foreground">{t("redirecting")}</p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
