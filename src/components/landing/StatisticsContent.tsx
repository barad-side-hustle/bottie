"use client";

import { useTranslations } from "next-intl";
import { Building2, MessageSquareText, Star, Clock } from "lucide-react";
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
      icon: Building2,
      value: stats.totalBusinesses,
      suffix: "+",
      label: t("businesses"),
      iconBgClass: "bg-pastel-lavender/20",
    },
    {
      icon: MessageSquareText,
      value: stats.totalAiResponses,
      suffix: "+",
      label: t("responses"),
      iconBgClass: "bg-pastel-mint/20",
    },
    {
      icon: Star,
      value: stats.averageRating,
      decimals: 1,
      suffix: "",
      label: t("avgRating"),
      iconBgClass: "bg-pastel-peach/20",
    },
    {
      icon: Clock,
      value: stats.hoursSaved,
      suffix: "+",
      label: t("hoursSaved"),
      iconBgClass: "bg-pastel-sky/20",
    },
  ];

  return (
    <SectionBlock tone="cream" width="md">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
        {statItems.map((item, index) => (
          <StatCard
            key={index}
            icon={item.icon}
            value={item.value}
            decimals={item.decimals}
            suffix={item.suffix}
            label={item.label}
            iconBgClass={item.iconBgClass}
          />
        ))}
      </div>
    </SectionBlock>
  );
}
