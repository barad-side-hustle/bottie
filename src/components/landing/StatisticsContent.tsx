"use client";

import { useTranslations } from "next-intl";
import { SectionBlock } from "@/components/ui/section-block";
import { StatCard } from "./StatCard";
import type { LandingStats } from "@/lib/data/landing-stats";

interface StatisticsContentProps {
  stats: LandingStats;
}

export function StatisticsContent({ stats }: StatisticsContentProps) {
  const t = useTranslations("landing.stats");

  const statItems = [
    {
      value: stats.totalBusinesses,
      suffix: "+",
      label: t("businesses"),
    },
    {
      value: stats.totalAiResponses,
      suffix: "+",
      label: t("responses"),
      accent: true,
    },
    {
      value: stats.averageRating,
      decimals: 1,
      suffix: "",
      label: t("avgRating"),
    },
    {
      value: stats.hoursSaved,
      suffix: "+",
      label: t("hoursSaved"),
    },
  ];

  return (
    <SectionBlock tone="cream" width="md">
      <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-border sm:rtl:divide-x-reverse">
        {statItems.map((item, index) => (
          <StatCard
            key={index}
            value={item.value}
            decimals={item.decimals}
            suffix={item.suffix}
            label={item.label}
            accent={item.accent}
          />
        ))}
      </div>
    </SectionBlock>
  );
}
