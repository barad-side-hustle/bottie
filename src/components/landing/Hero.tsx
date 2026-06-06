"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { CheckCircle2, Star } from "lucide-react";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("landing.hero");

  return (
    <section id="hero" tabIndex={-1} className="bg-pastel-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center pt-28 text-center md:pt-36">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-border/60">
            <span className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="size-3.5 fill-star-filled text-star-filled" />
              ))}
            </span>
            <span className="tabular-nums text-foreground">5.0</span>
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {t("title")}{" "}
            <span className="text-primary underline decoration-brand/40 decoration-4 underline-offset-[10px]">
              {t("titleHighlight")}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("description")}</p>

          <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="pill" className="w-full sm:w-auto">
              <Link href="/login">{t("cta")}</Link>
            </Button>
            <Button asChild size="pill" variant="outline" className="w-full sm:w-auto">
              <a href="#how-it-works">{t("ctaSecondary")}</a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {[t("badge1"), t("badge2")].map((badge) => (
              <div key={badge} className="flex items-center gap-2 font-medium text-foreground/80">
                <CheckCircle2 className="size-4 text-brand" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
