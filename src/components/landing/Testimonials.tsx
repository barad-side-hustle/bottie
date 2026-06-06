"use client";

import { Quote, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";

export function Testimonials() {
  const t = useTranslations("landing.testimonials");

  return (
    <SectionBlock tone="periwinkle" id="testimonials" tabIndex={-1} width="md">
      <SectionHeading title={t("title")} />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-3xl border border-border/60 bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <Quote className="size-8 fill-primary/15 text-primary/15" />
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="size-4 fill-star-filled text-star-filled" />
                ))}
              </div>
            </div>

            <p className="mb-8 text-base leading-relaxed text-foreground/80">{t(`items.${i}.quote`)}</p>

            <div className="mt-auto flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                {t(`items.${i}.name`).charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{t(`items.${i}.name`)}</div>
                <div className="text-xs text-muted-foreground">{t(`items.${i}.role`)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}
