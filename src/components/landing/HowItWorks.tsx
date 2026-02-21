"use client";

import { Button } from "@/components/ui/button";
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
    <div id="how-it-works" tabIndex={-1}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {STEPS.map((step, index) => {
              const stepNumber = index + 1;
              const pc = PASTEL_CLASSES[step.pastel];
              return (
                <div
                  key={index}
                  className={cn(
                    "relative overflow-hidden rounded-2xl",
                    "border border-border/60 bg-primary/[0.03] shadow-sm",
                    "p-8"
                  )}
                >
                  <div className="flex items-start gap-5">
                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", pc.iconBg)}>
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                        {stepNumber.toString().padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">{t(step.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-6">{t("ctaText")}</p>
          <Link href="/login">
            <Button className="text-lg px-8">{t("ctaButton")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
