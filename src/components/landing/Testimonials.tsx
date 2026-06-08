"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";

export function Testimonials() {
  const t = useTranslations("landing.testimonials");

  return (
    <SectionBlock tone="muted" id="testimonials" tabIndex={-1} width="md">
      <SectionHeading title={t("title")} />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col rounded-lg border border-hairline bg-surface p-8">
            <div className="mb-6 flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} className="size-3.5 fill-star-filled text-star-filled" />
              ))}
            </div>

            <p className="mb-8 text-base leading-relaxed text-ink-2">{t(`items.${i}.quote`)}</p>

            <div className="mt-auto flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-surface-2 text-sm font-medium text-ink-2">
                {t(`items.${i}.name`).charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{t(`items.${i}.name`)}</div>
                <div className="text-xs text-ink-3">{t(`items.${i}.role`)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}
