"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";
import {
  Bot,
  Zap,
  Shield,
  Globe,
  Star,
  Users,
  BarChart3,
  Megaphone,
  HeartPulse,
  Lock,
  Server,
  RefreshCw,
} from "lucide-react";

const FEATURES = [
  { icon: Bot, key: "aiPowered" },
  { icon: Zap, key: "autoPublish" },
  { icon: Shield, key: "reputation" },
  { icon: Globe, key: "multiLanguage" },
  { icon: Star, key: "customTone" },
  { icon: Users, key: "multiLocation" },
  { icon: Megaphone, key: "googlePosts" },
  { icon: BarChart3, key: "performanceAnalytics" },
  { icon: HeartPulse, key: "profileHealth" },
] as const;

const SECURITY_ITEMS = [
  { icon: Lock, key: "oauth" },
  { icon: Server, key: "encryption" },
  { icon: RefreshCw, key: "realtime" },
] as const;

export function AboutContent() {
  const t = useTranslations("about");

  return (
    <main className="grow">
      <SectionBlock tone="cream" width="md">
        <SectionHeading title={t("hero.title")} subtitle={t("hero.subtitle")} />
      </SectionBlock>

      <SectionBlock tone="plain" width="md">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t("mission.title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">{t("mission.content")}</p>

          <h2 className="text-2xl font-semibold text-foreground mb-4">{t("problem.title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{t("problem.content")}</p>
          <p className="text-muted-foreground leading-relaxed mb-8">{t("problem.content2")}</p>

          <h2 className="text-2xl font-semibold text-foreground mb-4">{t("solution.title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{t("solution.content")}</p>
          <p className="text-muted-foreground leading-relaxed mb-8">{t("solution.content2")}</p>
        </div>
      </SectionBlock>

      <SectionBlock tone="cream" width="lg">
        <SectionHeading title={t("features.title")} subtitle={t("features.subtitle")} className="mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-secondary text-primary">
                <Icon className="size-6" />
              </span>
              <h3 className="font-semibold text-foreground mb-2">{t(`features.items.${key}.title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`features.items.${key}.description`)}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock tone="plain" width="md">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t("platform.title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{t("platform.content")}</p>
          <p className="text-muted-foreground leading-relaxed mb-4">{t("platform.content2")}</p>
          <p className="text-muted-foreground leading-relaxed mb-8">{t("platform.content3")}</p>

          <h2 className="text-2xl font-semibold text-foreground mb-4">{t("howItWorks.title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{t("howItWorks.content")}</p>
          <p className="text-muted-foreground leading-relaxed mb-8">{t("howItWorks.content2")}</p>
        </div>
      </SectionBlock>

      <SectionBlock tone="periwinkle" width="lg">
        <SectionHeading title={t("security.title")} align="center" className="mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {SECURITY_ITEMS.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-sm text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-secondary text-primary">
                <Icon className="size-6" />
              </span>
              <h3 className="font-semibold text-foreground mb-2">{t(`security.items.${key}.title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`security.items.${key}.description`)}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock tone="plain" width="md">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t("pricing.title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{t("pricing.content")}</p>
          <p className="text-muted-foreground leading-relaxed mb-8">{t("pricing.content2")}</p>

          <h2 className="text-2xl font-semibold text-foreground mb-4">{t("team.title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{t("team.content")}</p>
          <p className="text-muted-foreground leading-relaxed mb-8">{t("team.content2")}</p>
        </div>
      </SectionBlock>

      <SectionBlock tone="primary" width="md">
        <SectionHeading title={t("cta.title")} subtitle={t("cta.subtitle")} inverted />
        <div className="mt-8 flex justify-center">
          <Button asChild size="pill" variant="outline">
            <Link href="/login">{t("cta.button")}</Link>
          </Button>
        </div>
      </SectionBlock>
    </main>
  );
}
