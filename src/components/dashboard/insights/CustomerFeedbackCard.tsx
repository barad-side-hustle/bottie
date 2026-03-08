"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import type { CategoryCount, ClassificationCategory, TopicCount } from "@/lib/types/classification.types";

interface CustomerFeedbackCardProps {
  topPositives: CategoryCount[];
  topNegatives: CategoryCount[];
  topics: TopicCount[];
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  onCategoryClick: (category: ClassificationCategory, type: "positive" | "negative") => void;
}

const MAX_TOPICS_COLLAPSED = 8;

export function CustomerFeedbackCard({
  topPositives,
  topNegatives,
  topics,
  sentimentBreakdown,
  onCategoryClick,
}: CustomerFeedbackCardProps) {
  const t = useTranslations("dashboard.insights");
  const tCategories = useTranslations("dashboard.insights.categories");
  const [showAllTopics, setShowAllTopics] = useState(false);

  const hasCategories = topPositives.length > 0 || topNegatives.length > 0;
  const hasTopics = topics.length > 0;

  const sentimentTotal = sentimentBreakdown.positive + sentimentBreakdown.neutral + sentimentBreakdown.negative;
  const positivePercent = sentimentTotal > 0 ? Math.round((sentimentBreakdown.positive / sentimentTotal) * 100) : 0;
  const neutralPercent = sentimentTotal > 0 ? Math.round((sentimentBreakdown.neutral / sentimentTotal) * 100) : 0;
  const negativePercent = sentimentTotal > 0 ? Math.round((sentimentBreakdown.negative / sentimentTotal) * 100) : 0;

  if (!hasCategories && !hasTopics && sentimentTotal === 0) {
    return (
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>{t("sections.customerFeedback")}</DashboardCardTitle>
        </DashboardCardHeader>
        <DashboardCardContent className="pt-0">
          <p className="text-muted-foreground text-sm py-4">{t("noCategories")}</p>
        </DashboardCardContent>
      </DashboardCard>
    );
  }

  const visibleTopics = showAllTopics ? topics : topics.slice(0, MAX_TOPICS_COLLAPSED);

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{t("sections.customerFeedback")}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent className="pt-0">
        {sentimentTotal > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">{t("scoreboard.sentiment")}</p>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-success" />
                  {t("overview.positiveSentiment")} {positivePercent}%
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                  {t("overview.neutralSentiment")} {neutralPercent}%
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-destructive" />
                  {t("overview.negativeSentiment")} {negativePercent}%
                </span>
              </div>
            </div>
            <div className="flex w-full h-3 rounded-full overflow-hidden gap-px">
              {positivePercent > 0 && (
                <div className="bg-success rounded-s-full transition-all" style={{ width: `${positivePercent}%` }} />
              )}
              {neutralPercent > 0 && (
                <div className="bg-muted-foreground/25 transition-all" style={{ width: `${neutralPercent}%` }} />
              )}
              {negativePercent > 0 && (
                <div
                  className="bg-destructive rounded-e-full transition-all"
                  style={{ width: `${negativePercent}%` }}
                />
              )}
            </div>
          </div>
        )}

        {hasCategories && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="size-4 text-success" />
                <h4 className="text-sm font-medium text-success">{tCategories("topPositives")}</h4>
              </div>
              <div className="space-y-0.5">
                {topPositives.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => onCategoryClick(cat.category, "positive")}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer text-start"
                  >
                    <span className="flex-1 text-sm font-medium truncate">{tCategories(cat.category)}</span>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </button>
                ))}
                {topPositives.length === 0 && <p className="text-sm text-muted-foreground py-2">{t("noCategories")}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="size-4 text-destructive" />
                <h4 className="text-sm font-medium text-destructive">{tCategories("topNegatives")}</h4>
              </div>
              <div className="space-y-0.5">
                {topNegatives.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => onCategoryClick(cat.category, "negative")}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer text-start"
                  >
                    <span className="flex-1 text-sm font-medium truncate">{tCategories(cat.category)}</span>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </button>
                ))}
                {topNegatives.length === 0 && <p className="text-sm text-muted-foreground py-2">{t("noCategories")}</p>}
              </div>
            </div>
          </div>
        )}

        {hasTopics && (
          <div className={hasCategories || sentimentTotal > 0 ? "mt-6 pt-6 border-t border-border/40" : ""}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">{t("sections.topics")}</h4>
            <div className="flex flex-wrap gap-2">
              {visibleTopics.map((topic) => (
                <Badge key={topic.topic} variant="secondary" className="text-sm font-normal px-3 py-1.5">
                  {topic.topic}
                  <span className="ms-1.5 text-muted-foreground">({topic.count})</span>
                </Badge>
              ))}
            </div>
            {topics.length > MAX_TOPICS_COLLAPSED && (
              <button
                type="button"
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                {showAllTopics ? (
                  <>
                    {t("showLess")} <ChevronUp className="size-3" />
                  </>
                ) : (
                  <>
                    {t("showAll", { count: topics.length })} <ChevronDown className="size-3" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
