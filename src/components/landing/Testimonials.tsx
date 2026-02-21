"use client";

import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";

export function Testimonials() {
  const t = useTranslations("landing.testimonials");

  return (
    <section id="testimonials" tabIndex={-1}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative p-8 rounded-2xl border border-border/60 bg-primary/[0.03] shadow-sm">
              <Quote className="h-8 w-8 text-primary/15 mb-4" />

              <p className="text-muted-foreground text-base leading-relaxed mb-8">{t(`items.${i}.quote`)}</p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
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
      </div>
    </section>
  );
}
