"use client";

import { SectionBlock } from "@/components/ui/section-block";
import { MessageSquareText, SlidersHorizontal, LineChart } from "lucide-react";
import { useTranslations } from "next-intl";

const POINTS = [
  { icon: MessageSquareText, titleKey: "points.0.title", descKey: "points.0.description" },
  { icon: SlidersHorizontal, titleKey: "points.1.title", descKey: "points.1.description" },
  { icon: LineChart, titleKey: "points.2.title", descKey: "points.2.description" },
] as const;

export function WhyBottie() {
  const t = useTranslations("landing.whyBottie");

  return (
    <SectionBlock tone="plain" id="why-bottie" tabIndex={-1} width="lg">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-text">{t("eyebrow")}</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl md:text-[2.5rem] md:leading-[1.1]">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-2">{t("subtitle")}</p>
        </div>

        <div className="md:col-span-7">
          <dl className="flex flex-col">
            {POINTS.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-5 border-t border-hairline py-7 first:border-t-0 first:pt-0 last:pb-0"
              >
                <point.icon className="mt-0.5 size-5 shrink-0 text-ink-2" strokeWidth={1.5} aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-lg font-semibold text-foreground">{t(point.titleKey)}</dt>
                  <dd className="mt-2 text-base leading-relaxed text-ink-2">{t(point.descKey)}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </SectionBlock>
  );
}
