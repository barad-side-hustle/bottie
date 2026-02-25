"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { ToneOfVoice } from "@/lib/types";
import type { Locale } from "@/lib/locale";
import { DemoSettingsPanel } from "./demo/DemoSettingsPanel";
import { DemoReviewCard } from "./demo/DemoReviewCard";
import { getReviews, getResponse, type DemoLanguage, type DemoConcreteLanguage } from "./demo/demo-data";

const localeToLanguage: Record<Locale, DemoConcreteLanguage> = {
  en: "english",
  he: "hebrew",
  es: "spanish",
};

export function Demo() {
  const t = useTranslations("landing.demo");
  const locale = useLocale() as Locale;

  const [tone, setTone] = useState<ToneOfVoice>("professional");
  const [language, setLanguage] = useState<DemoLanguage>("auto-detect");
  const [variantIndices, setVariantIndices] = useState<Record<string, number>>({});
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const triggerStaggeredLoading = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const reviewIds = ["demo-5", "demo-3", "demo-1"];

    setLoadingCards(
      reviewIds.reduce(
        (acc, id) => {
          acc[id] = true;
          return acc;
        },
        {} as Record<string, boolean>
      )
    );

    reviewIds.forEach((id, index) => {
      const baseDelay = 600 + index * 300;
      const randomOffset = Math.random() * 300;
      const delay = baseDelay + randomOffset;

      const timeout = setTimeout(() => {
        setLoadingCards((prev) => ({ ...prev, [id]: false }));
        setVariantIndices((prev) => ({
          ...prev,
          [id]: (prev[id] ?? 0) === 0 ? 1 : 0,
        }));
      }, delay);

      timeoutsRef.current.push(timeout);
    });
  }, []);

  const handleToneChange = useCallback(
    (value: ToneOfVoice) => {
      setTone(value);
      triggerStaggeredLoading();
    },
    [triggerStaggeredLoading]
  );

  const handleLanguageChange = useCallback(
    (value: DemoLanguage) => {
      setLanguage(value);
      triggerStaggeredLoading();
    },
    [triggerStaggeredLoading]
  );

  const reviewLanguage = localeToLanguage[locale] ?? "english";
  const resolvedLanguage = language === "auto-detect" ? reviewLanguage : language;
  const reviews = getReviews(reviewLanguage);

  return (
    <section id="demo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
            <DemoSettingsPanel
              tone={tone}
              language={language}
              onToneChange={handleToneChange}
              onLanguageChange={handleLanguageChange}
            />

            <div className="space-y-4">
              {reviews.map((review) => {
                const variantIndex = variantIndices[review.id] ?? 0;
                const replyText = getResponse(resolvedLanguage, tone, review.rating, variantIndex);
                const isLoading = loadingCards[review.id] ?? false;

                return <DemoReviewCard key={review.id} review={review} replyText={replyText} isLoading={isLoading} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
