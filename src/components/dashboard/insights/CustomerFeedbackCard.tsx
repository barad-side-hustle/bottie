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
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-3">{t("scoreboard.sentiment")}</p>
            <SentimentBar
              label={t("overview.positiveSentiment")}
              percent={positivePercent}
              barClassName="bg-positive"
              labelClassName="text-success-foreground"
            />
            <SentimentBar
              label={t("overview.neutralSentiment")}
              percent={neutralPercent}
              barClassName="bg-chart-neutral"
              labelClassName="text-ink-2"
            />
            <SentimentBar
              label={t("overview.negativeSentiment")}
              percent={negativePercent}
              barClassName="bg-negative"
              labelClassName="text-destructive"
            />
          </div>
        )}

        {hasCategories && (
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <FeedbackList
              heading={tCategories("topPositives")}
              type="positive"
              categories={topPositives}
              emptyLabel={t("noCategories")}
              renderCategory={(c) => tCategories(c)}
              onCategoryClick={onCategoryClick}
            />
            <FeedbackList
              heading={tCategories("topNegatives")}
              type="negative"
              categories={topNegatives}
              emptyLabel={t("noCategories")}
              renderCategory={(c) => tCategories(c)}
              onCategoryClick={onCategoryClick}
            />
          </div>
        )}

        {hasTopics && (
          <div className={hasCategories || sentimentTotal > 0 ? "mt-6 pt-6 border-t border-hairline" : ""}>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-3">{t("sections.topics")}</h4>
            <div className="flex flex-wrap gap-2">
              {visibleTopics.map((topic) => (
                <Badge key={topic.topic} variant="secondary" className="px-2.5 py-1 text-sm font-normal">
                  {topic.topic}
                  <span className="ms-1.5 tabular-nums text-ink-3">{topic.count}</span>
                </Badge>
              ))}
            </div>
            {topics.length > MAX_TOPICS_COLLAPSED && (
              <button
                type="button"
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
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

function SentimentBar({
  label,
  percent,
  barClassName,
  labelClassName,
}: {
  label: string;
  percent: number;
  barClassName: string;
  labelClassName: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className={cn("w-16 shrink-0 text-xs font-medium", labelClassName)}>{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className={cn("h-full rounded-full", barClassName)} style={{ width: `${percent}%` }} />
      </div>
      <span className="w-10 shrink-0 text-end text-sm font-medium tabular-nums text-ink">{percent}%</span>
    </div>
  );
}

function FeedbackList({
  heading,
  type,
  categories,
  emptyLabel,
  renderCategory,
  onCategoryClick,
}: {
  heading: string;
  type: "positive" | "negative";
  categories: CategoryCount[];
  emptyLabel: string;
  renderCategory: (category: ClassificationCategory) => string;
  onCategoryClick: (category: ClassificationCategory, type: "positive" | "negative") => void;
}) {
  const Arrow = type === "positive" ? ArrowUpRight : ArrowDownRight;
  const arrowClass = type === "positive" ? "text-success" : "text-destructive";

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-3">{heading}</h4>
      {categories.length === 0 ? (
        <p className="py-2 text-sm text-ink-3">{emptyLabel}</p>
      ) : (
        <ul className="-mx-2">
          {categories.map((cat) => (
            <li key={cat.category}>
              <button
                type="button"
                onClick={() => onCategoryClick(cat.category, type)}
                className="group/row flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start transition-colors hover:bg-surface-2"
              >
                <Arrow className={cn("size-3.5 shrink-0", arrowClass)} aria-hidden />
                <span className="flex-1 truncate text-sm font-medium text-ink">{renderCategory(cat.category)}</span>
                <span className="shrink-0 text-sm tabular-nums text-ink-2">{cat.count}</span>
                <span className="w-9 shrink-0 text-end text-xs tabular-nums text-ink-3">{cat.percentage}%</span>
                <ChevronRight
                  className="size-3.5 shrink-0 text-ink-3 opacity-0 transition-opacity group-hover/row:opacity-100 rtl:rotate-180"
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
