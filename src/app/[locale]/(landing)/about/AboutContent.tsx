"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Bot, Zap, Shield, Globe, Star, Users } from "lucide-react";

const FEATURES = [
  { icon: Bot, key: "aiPowered" },
  { icon: Zap, key: "autoPublish" },
  { icon: Shield, key: "reputation" },
  { icon: Globe, key: "multiLanguage" },
  { icon: Star, key: "customTone" },
  { icon: Users, key: "multiLocation" },
] as const;

export function AboutContent() {
  const t = useTranslations("about");

  return (
    <main className="grow">
      <section className="bg-primary text-primary-foreground py-20 rounded-b-[2rem] md:rounded-b-[3rem]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">{t("hero.title")}</h1>
            <p className="text-lg sm:text-xl text-primary-foreground/70 leading-relaxed">{t("hero.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("mission.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("mission.content")}</p>

            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("problem.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("problem.content")}</p>

            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("solution.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("solution.content")}</p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-10">{t("features.title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FEATURES.map(({ icon: Icon, key }) => (
              <div key={key} className="bg-background rounded-xl p-6 border border-border">
                <Icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{t(`features.items.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`features.items.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("howItWorks.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("howItWorks.content")}</p>

            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("team.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("team.content")}</p>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-16 rounded-t-[2rem] md:rounded-t-[3rem]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">{t("cta.subtitle")}</p>
          <Button
            asChild
            size="lg"
            className="text-lg px-8 py-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link href="/login">{t("cta.button")}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
