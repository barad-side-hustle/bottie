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
      <div className="absolute inset-0 bg-primary" />

      <div className="absolute top-10 end-[5%] w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none bg-primary-foreground animate-hero-float will-change-transform" />
      <div className="absolute bottom-10 start-[5%] w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none bg-primary-foreground animate-hero-float-reverse will-change-transform" />
      <div
        className="absolute top-1/2 start-1/3 w-[300px] h-[300px] rounded-full opacity-5 blur-3xl pointer-events-none bg-primary-foreground animate-hero-float will-change-transform"
        style={{ animationDelay: "2s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl text-center py-20 md:py-28">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl leading-tight text-primary-foreground">
            <span className="animate-hero-fade-in-up block" style={{ animationDelay: "0.1s" }}>
              {t("title")}
            </span>
            <span
              className="animate-hero-fade-in-up block mt-2 text-primary-foreground underline decoration-primary-foreground/30 underline-offset-8 decoration-4"
              style={{ animationDelay: "0.25s" }}
            >
              {t("titleHighlight")}
            </span>
          </h1>

          <p
            className="animate-hero-fade-in-up mb-10 text-lg sm:text-xl text-primary-foreground/70 max-w-xl mx-auto leading-relaxed"
            style={{ animationDelay: "0.4s" }}
          >
            {t("description")}
          </p>

          <div
            className="animate-hero-fade-in-up flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
            style={{ animationDelay: "0.55s" }}
          >
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <Link href="/login">{t("cta")}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300"
            >
              <a href="#how-it-works">{t("ctaSecondary")}</a>
            </Button>
          </div>

          <div
            className="animate-hero-fade-in-up flex flex-wrap items-center justify-center gap-4 text-sm"
            style={{ animationDelay: "0.7s" }}
          >
            <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
              <span className="font-medium text-primary-foreground/80">{t("badge1")}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
              <span className="font-medium text-primary-foreground/80">{t("badge2")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
