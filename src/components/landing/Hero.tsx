"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Check, Star } from "lucide-react";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("landing.hero");

  return (
    <section id="hero" tabIndex={-1} className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 pt-24 pb-16 md:pt-32 md:pb-24 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col items-start text-start lg:col-span-5">
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-foreground text-balance sm:text-5xl">
              {t("headline")}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{t("subhead")}</p>

            <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/login">{t("ctaPrimary")}</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto">
                <a href="#how-it-works">{t("ctaSecondary")}</a>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-2">
              {[t("trust.0"), t("trust.1")].map((chip) => (
                <span key={chip} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-ink-3" aria-hidden />
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-hairline bg-surface shadow-lg">
              <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-surface-3 text-xs font-semibold text-ink-2">
                    {t("preview.businessName").charAt(0)}
                  </span>
                  <span className="text-sm font-medium text-foreground">{t("preview.businessName")}</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-pending-tint px-2.5 py-1 text-xs font-medium text-warning-foreground">
                  {t("preview.statusPending")}
                </span>
              </div>

              <div className="flex gap-3.5 px-5 py-5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-ink-2">
                  {t("preview.reviewer").charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="text-sm font-medium text-foreground">{t("preview.reviewer")}</span>
                    <span className="flex items-center gap-0.5" aria-hidden>
                      {[0, 1, 2, 3].map((i) => (
                        <Star key={i} className="size-3.5 fill-star-filled text-star-filled" />
                      ))}
                      <Star className="size-3.5 text-star-filled" />
                    </span>
                    <span className="text-xs tabular-nums text-ink-3">{t("preview.timeAgo")}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{t("preview.reviewText")}</p>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="rounded-md bg-surface-2 p-4">
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
                    {t("preview.replyLabel")}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{t("preview.replyText")}</p>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm">{t("preview.approve")}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
