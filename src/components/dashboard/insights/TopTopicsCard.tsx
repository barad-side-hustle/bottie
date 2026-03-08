"use client";

import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { useTranslations } from "next-intl";
import type { TopicCount } from "@/lib/types/classification.types";
import { Badge } from "@/components/ui/badge";

interface TopTopicsCardProps {
  topics: TopicCount[];
}

export function TopTopicsCard({ topics }: TopTopicsCardProps) {
  const t = useTranslations("dashboard.insights");

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{t("sections.topics")}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Badge key={topic.topic} variant="secondary" className="text-sm font-normal px-3 py-1.5">
              {topic.topic}
              <span className="ms-1.5 text-muted-foreground">({topic.count})</span>
            </Badge>
          ))}
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
