"use client";

import { useTranslations } from "next-intl";

export function Statistics() {
  const t = useTranslations("landing.stats");

  return (
    <section className="py-20 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-5xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">{t("businesses")}</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-primary mb-2">10K+</div>
            <div className="text-muted-foreground">{t("responses")}</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-primary mb-2">98%</div>
            <div className="text-muted-foreground">{t("satisfaction")}</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-primary mb-2">1K+</div>
            <div className="text-muted-foreground">{t("hoursSaved")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
