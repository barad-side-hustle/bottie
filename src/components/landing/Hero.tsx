"use client";

import { Button } from "@/components/ui/button";

import { Link } from "@/i18n/routing";
import { CheckCircle2 } from "lucide-react";

import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section
      id="hero"
      tabIndex={-1}
      className="relative overflow-hidden min-h-[60vh] md:min-h-[90vh] flex items-center rounded-b-[2rem] md:rounded-b-[3rem] lg:rounded-b-[4rem]"
    >
      <div className="absolute inset-0 bg-gradient-soft" />

      <div className="absolute top-20 end-10 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl pointer-events-none bg-pastel-lavender" />
      <div className="absolute bottom-20 start-10 w-[400px] h-[400px] rounded-full opacity-40 blur-3xl pointer-events-none bg-pastel-sky" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-center gap-16 md:gap-16 py-16 md:py-20">
          <div className="w-full md:w-1/2 order-2 flex items-center justify-center"></div>
          <div className="w-full md:w-1/2 text-center md:text-start order-1">
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl leading-tight">
              {t("title")}
              <span className="block text-primary mt-2">{t("titleHighlight")}</span>
            </h1>

            <p className="mb-10 text-xl text-muted-foreground max-w-xl mx-auto md:ms-0 leading-relaxed">
              {t("description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center mb-10">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 shadow-primary hover:shadow-xl transition-all duration-300"
              >
                <Link href="/login">{t("cta")}</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{t("badge1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{t("badge2")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
