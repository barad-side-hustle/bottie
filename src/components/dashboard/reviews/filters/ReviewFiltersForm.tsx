"use client";

import { useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ToggleChip } from "@/components/ui/toggle-chip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FilterSection } from "./FilterSection";
import { ReviewFilters, ReviewSortField, ReplyStatus, Sentiment } from "@/lib/types";
import { ArrowDown, ArrowUp, Star } from "lucide-react";
import { he, enUS } from "date-fns/locale";
import { Locale } from "date-fns";

const localeMap: Record<string, Locale> = {
  he,
  en: enUS,
};

interface ReviewFiltersFormProps {
  filters: ReviewFilters;
  onApply: (filters: ReviewFilters) => void;
  onReset: () => void;
}

export function ReviewFiltersForm({ filters, onApply, onReset }: ReviewFiltersFormProps) {
  const t = useTranslations("dashboard.reviews.filters");
  const locale = useLocale();
  const dateLocale = localeMap[locale] || enUS;

  const apply = useCallback((newFilters: ReviewFilters) => onApply(newFilters), [onApply]);

  const handleReplyStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = filters.replyStatus || [];
    const newStatuses = checked ? [...currentStatuses, status] : currentStatuses.filter((s) => s !== status);
    apply({ ...filters, replyStatus: newStatuses as ReplyStatus[] });
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    const currentRatings = filters.rating || [];
    const newRatings = checked ? [...currentRatings, rating] : currentRatings.filter((r) => r !== rating);
    apply({ ...filters, rating: newRatings });
  };

  const handleSentimentChange = (sentiment: string, checked: boolean) => {
    const currentSentiments = filters.sentiment || [];
    const newSentiments = checked
      ? [...currentSentiments, sentiment]
      : currentSentiments.filter((s) => s !== sentiment);
    apply({ ...filters, sentiment: newSentiments as Sentiment[] });
  };

  const handleSortFieldChange = (value: string) => {
    apply({
      ...filters,
      sort: {
        orderBy: value as ReviewSortField,
        orderDirection: filters.sort?.orderDirection || "desc",
      },
    });
  };

  const toggleSortDirection = () => {
    apply({
      ...filters,
      sort: {
        orderBy: filters.sort?.orderBy || "date",
        orderDirection: filters.sort?.orderDirection === "asc" ? "desc" : "asc",
      },
    });
  };

  return (
    <div className="space-y-6">
      <FilterSection title={t("replyStatus")}>
        <div className="flex flex-wrap gap-2">
          {["pending", "posted", "failed"].map((status) => (
            <ToggleChip
              key={status}
              selected={filters.replyStatus?.includes(status as ReplyStatus) ?? false}
              onToggle={(checked) => handleReplyStatusChange(status, checked)}
            >
              {t(`status.${status}`)}
            </ToggleChip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={t("rating")}>
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <ToggleChip
              key={rating}
              selected={filters.rating?.includes(rating) ?? false}
              onToggle={(checked) => handleRatingChange(rating, checked)}
            >
              <span className="flex items-center gap-0.5" dir="ltr">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-star-filled text-star-filled" />
                ))}
              </span>
            </ToggleChip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={t("sentiment")}>
        <div className="flex flex-wrap gap-2">
          {(["positive", "neutral", "negative"] as const).map((sentiment) => (
            <ToggleChip
              key={sentiment}
              selected={filters.sentiment?.includes(sentiment) ?? false}
              onToggle={(checked) => handleSentimentChange(sentiment, checked)}
            >
              {t(`sentimentValues.${sentiment}`)}
            </ToggleChip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={t("dateRange")}>
        <DateRangePicker
          date={{ from: filters.dateFrom, to: filters.dateTo }}
          setDate={(range) => apply({ ...filters, dateFrom: range?.from, dateTo: range?.to })}
          locale={dateLocale}
          placeholder={t("pickDate")}
          showPresets
          presets={[
            { label: t("last7Days"), days: 7 },
            { label: t("last30Days"), days: 30 },
            { label: t("last90Days"), days: 90 },
          ]}
          title={t("selectDateRange")}
        />
      </FilterSection>

      <FilterSection title={t("sortBy")}>
        <div className="flex gap-2">
          <Select value={filters.sort?.orderBy || "receivedAt"} onValueChange={handleSortFieldChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receivedAt">{t("sort.receivedAt")}</SelectItem>
              <SelectItem value="rating">{t("sort.rating")}</SelectItem>
              <SelectItem value="date">{t("sort.date")}</SelectItem>
              <SelectItem value="replyStatus">{t("sort.replyStatus")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={toggleSortDirection} title={t("sort.direction")}>
            {filters.sort?.orderDirection === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </FilterSection>

      <div className="flex justify-end pt-4 border-t border-border/40">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}
