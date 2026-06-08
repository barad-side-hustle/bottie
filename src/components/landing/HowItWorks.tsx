"use client";

import { Button } from "@/components/ui/button";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";
import { Link2, PenLine, Send } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const STEPS = [
  { icon: Link2, titleKey: "steps.0.title", descKey: "steps.0.description" },
  { icon: PenLine, titleKey: "steps.1.title", descKey: "steps.1.description" },
  { icon: Send, titleKey: "steps.2.title", descKey: "steps.2.description" },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  return (
    <SectionBlock tone="cream" id="how-it-works" tabIndex={-1} width="md">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <ol className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={index} className="flex flex-col gap-4 bg-surface p-8">
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-ink-2" strokeWidth={1.75} />
                <span className="text-sm font-medium tabular-nums text-ink-3">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-lg font-medium tracking-tight text-ink">{t(step.titleKey)}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{t(step.descKey)}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-12 flex flex-col items-center gap-4 text-center">
        <p className="text-base text-ink-2">{t("ctaText")}</p>
        <Button asChild size="lg">
          <Link href="/login">{t("ctaButton")}</Link>
        </Button>
      </div>
    </SectionBlock>
  );
}
