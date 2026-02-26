"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";
import { CircularProgress } from "@/components/ui/circular-progress";

const REDIRECT_DELAY_MS = 2500;

export function CompletionCelebration() {
  const router = useRouter();
  const t = useTranslations("onboarding.importProgress");
  const confettiFired = useRef(false);

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

  useEffect(() => {
    fireConfetti();
    const timer = setTimeout(() => {
      router.push("/dashboard/home");
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [fireConfetti, router]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-onboarding-fade-in"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div className="absolute top-1/4 start-1/4 h-64 w-64 rounded-full bg-pastel-lavender/20 blur-3xl" />
      <div className="absolute bottom-1/3 end-1/4 h-48 w-48 rounded-full bg-pastel-sky/20 blur-3xl" />
      <div className="absolute top-1/2 end-1/3 h-56 w-56 rounded-full bg-pastel-peach/15 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md mx-auto px-4 text-center">
        <CircularProgress value={100} size={140} strokeWidth={10} />

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{t("completeTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("completeDescription")}</p>
        </div>

        <p className="text-xs text-muted-foreground">{t("redirecting")}</p>
      </div>
    </div>
  );
}
