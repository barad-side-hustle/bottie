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
      <SectionBlock tone="plain" width="md">
        <SectionHeading title={t("hero.title")} subtitle={t("hero.subtitle")} align="start" />
      </SectionBlock>

      <SectionBlock tone="muted" width="md" className="border-y border-hairline">
        <div className="max-w-2xl space-y-12">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
              {t("mission.title")}
            </h2>
            <p className="text-base leading-relaxed text-ink-2">{t("mission.content")}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
              {t("problem.title")}
            </h2>
            <p className="text-base leading-relaxed text-ink-2">{t("problem.content")}</p>
            <p className="text-base leading-relaxed text-ink-2">{t("problem.content2")}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
              {t("solution.title")}
            </h2>
            <p className="text-base leading-relaxed text-ink-2">{t("solution.content")}</p>
            <p className="text-base leading-relaxed text-ink-2">{t("solution.content2")}</p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock tone="plain" width="lg">
        <SectionHeading
          title={t("features.title")}
          subtitle={t("features.subtitle")}
          align="start"
          className="mb-14 max-w-2xl"
        />
        <dl className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, key }) => (
            <div key={key} className="flex gap-4 border-t border-hairline pt-6">
              <Icon className="mt-0.5 size-5 shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
              <div className="space-y-1.5">
                <dt className="text-base font-medium text-ink">{t(`features.items.${key}.title`)}</dt>
                <dd className="text-sm leading-relaxed text-ink-2">{t(`features.items.${key}.description`)}</dd>
              </div>
            </div>
          ))}
        </dl>
      </SectionBlock>

      <SectionBlock tone="muted" width="md" className="border-y border-hairline">
        <div className="max-w-2xl space-y-12">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
              {t("platform.title")}
            </h2>
            <p className="text-base leading-relaxed text-ink-2">{t("platform.content")}</p>
            <p className="text-base leading-relaxed text-ink-2">{t("platform.content2")}</p>
            <p className="text-base leading-relaxed text-ink-2">{t("platform.content3")}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
              {t("howItWorks.title")}
            </h2>
            <p className="text-base leading-relaxed text-ink-2">{t("howItWorks.content")}</p>
            <p className="text-base leading-relaxed text-ink-2">{t("howItWorks.content2")}</p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock tone="plain" width="md">
        <SectionHeading title={t("security.title")} align="start" className="mb-12 max-w-2xl" />
        <dl className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-3">
          {SECURITY_ITEMS.map(({ icon: Icon, key }) => (
            <div key={key} className="space-y-2 border-t border-hairline pt-6">
              <Icon className="size-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
              <dt className="text-base font-medium text-ink">{t(`security.items.${key}.title`)}</dt>
              <dd className="text-sm leading-relaxed text-ink-2">{t(`security.items.${key}.description`)}</dd>
            </div>
          ))}
        </dl>
      </SectionBlock>

      <SectionBlock tone="muted" width="md" className="border-y border-hairline">
        <div className="max-w-2xl space-y-12">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
              {t("pricing.title")}
            </h2>
            <p className="text-base leading-relaxed text-ink-2">{t("pricing.content")}</p>
            <p className="text-base leading-relaxed text-ink-2">{t("pricing.content2")}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">{t("team.title")}</h2>
            <p className="text-base leading-relaxed text-ink-2">{t("team.content")}</p>
            <p className="text-base leading-relaxed text-ink-2">{t("team.content2")}</p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock tone="primary" width="md">
        <SectionHeading title={t("cta.title")} subtitle={t("cta.subtitle")} inverted />
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/login">{t("cta.button")}</Link>
          </Button>
        </div>
      </SectionBlock>
    </main>
  );
}
