"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function FinalCTA() {
  const t = useTranslations("landing.finalCTA");

  return (
    <section className="relative overflow-hidden rounded-t-[2rem] md:rounded-t-[3rem] lg:rounded-t-[4rem]">
      <div className="absolute inset-0 bg-primary" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-24 md:py-32">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-primary-foreground tracking-tight">
          {t("title")}
        </h2>
        <p className="text-lg text-primary-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">{t("description")}</p>

        <Link href="/login">
          <Button
            size="lg"
            className="text-lg px-10 py-7 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            {t("cta")}
          </Button>
        </Link>

        <p className="mt-8 text-sm text-primary-foreground/50">{t("noCreditCard")}</p>
      </div>
    </section>
  );
}
