"use client";

import { Button } from "@/components/ui/button";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";
import { Link2, Settings, MessageSquare, CheckCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Link2, titleKey: "steps.0.title", descKey: "steps.0.description", pastel: "lavender" },
  { icon: Settings, titleKey: "steps.1.title", descKey: "steps.1.description", pastel: "sky" },
  { icon: MessageSquare, titleKey: "steps.2.title", descKey: "steps.2.description", pastel: "mint" },
  { icon: CheckCircle, titleKey: "steps.3.title", descKey: "steps.3.description", pastel: "peach" },
] as const;

const PASTEL_CLASSES = {
  lavender: { iconBg: "bg-pastel-lavender/20" },
  sky: { iconBg: "bg-pastel-sky/20" },
  mint: { iconBg: "bg-pastel-mint/20" },
  peach: { iconBg: "bg-pastel-peach/20" },
} as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  return (
    <SectionBlock tone="cream" id="how-it-works" tabIndex={-1} width="md">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const pc = PASTEL_CLASSES[step.pastel];
          return (
            <div
              key={index}
              className={cn(
                "flex items-start gap-5 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8",
                "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              )}
            >
              <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl", pc.iconBg)}>
                <step.icon className="size-6 text-primary" />
              </div>

              <div className="min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {stepNumber.toString().padStart(2, "0")}
                </span>
                <h3 className="mb-2 mt-1 text-lg font-semibold text-foreground">{t(step.titleKey)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(step.descKey)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex flex-col items-center gap-6 text-center">
        <p className="text-lg text-muted-foreground">{t("ctaText")}</p>
        <Button asChild size="pill">
          <Link href="/login">{t("ctaButton")}</Link>
        </Button>
      </div>
    </SectionBlock>
  );
}
