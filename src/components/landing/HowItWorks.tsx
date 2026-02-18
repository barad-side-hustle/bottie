"use client";

import { Button } from "@/components/ui/button";
import { Link2, Settings, MessageSquare, CheckCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const STEPS = [
  {
    icon: Link2,
    titleKey: "steps.0.title",
    descKey: "steps.0.description",
  },
  {
    icon: Settings,
    titleKey: "steps.1.title",
    descKey: "steps.1.description",
  },
  {
    icon: MessageSquare,
    titleKey: "steps.2.title",
    descKey: "steps.2.description",
  },
  {
    icon: CheckCircle,
    titleKey: "steps.3.title",
    descKey: "steps.3.description",
  },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  return (
    <div id="how-it-works" tabIndex={-1}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
            {STEPS.map((step, index) => {
              const stepNumber = index + 1;
              return (
                <div
                  key={index}
                  className="p-8 relative overflow-hidden border border-border/40 shadow-sm rounded-2xl bg-card text-card-foreground cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />

                  <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-lg transition-all duration-500" />

                  <div className="absolute top-4 end-4 text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors duration-500">
                    {stepNumber}
                  </div>

                  <div className="relative">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-pastel-lavender/20 group-hover:bg-pastel-lavender/30 group-hover:scale-110 transition-all duration-300">
                      <step.icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-foreground">{t(step.titleKey)}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-6">{t("ctaText")}</p>
          <Link href="/login">
            <Button className="text-lg px-8">{t("ctaButton")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
