"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewFilters } from "@/lib/types";
import { X, Star } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { Locale } from "date-fns";

const localeMap: Record<string, Locale> = {
  he,
  en: enUS,
};

interface ActiveFiltersProps {
  filters: ReviewFilters;
  onRemove: (key: keyof ReviewFilters, value?: string | number) => void;
  onClearAll: () => void;
  hideReplyStatus?: boolean;
}

export function ActiveFilters({ filters, onRemove, onClearAll, hideReplyStatus = false }: ActiveFiltersProps) {
  const t = useTranslations("dashboard.reviews.filters");
  const locale = useLocale();
  const dateLocale = localeMap[locale] || enUS;

  const showReplyStatus = !hideReplyStatus && (filters.replyStatus?.length ?? 0) > 0;

  const hasFilters =
    showReplyStatus ||
    (filters.rating?.length ?? 0) > 0 ||
    (filters.sentiment?.length ?? 0) > 0 ||
    filters.dateFrom ||
    filters.dateTo;

  if (!hasFilters) return null;

  const removeButtonClass =
    "-me-0.5 flex size-4 items-center justify-center rounded-sm text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showReplyStatus &&
        filters.replyStatus?.map((status) => (
          <Badge key={status} variant="outline" className="gap-1 bg-surface-2 ps-2.5 pe-1 py-1 text-ink">
            {t(`status.${status}`)}
            <button
              type="button"
              className={removeButtonClass}
              onClick={() => onRemove("replyStatus", status)}
              aria-label={t("removeFilter")}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </Badge>
        ))}

      {filters.rating?.map((rating) => (
        <Badge key={rating} variant="outline" className="gap-1 bg-surface-2 ps-2.5 pe-1 py-1 text-ink">
          <span className="inline-flex items-center gap-0.5 tabular-nums">
            {rating}
            <Star className="size-3 fill-star-filled text-star-filled" aria-hidden="true" />
          </span>
          <button
            type="button"
            className={removeButtonClass}
            onClick={() => onRemove("rating", rating)}
            aria-label={t("removeFilter")}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}

      {filters.sentiment?.map((sentiment) => (
        <Badge key={sentiment} variant="outline" className="gap-1 bg-surface-2 ps-2.5 pe-1 py-1 text-ink">
          {t(`sentimentValues.${sentiment}`)}
          <button
            type="button"
            className={removeButtonClass}
            onClick={() => onRemove("sentiment", sentiment)}
            aria-label={t("removeFilter")}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}

      {(filters.dateFrom || filters.dateTo) && (
        <Badge variant="outline" className="gap-1 bg-surface-2 ps-2.5 pe-1 py-1 text-ink">
          <span className="tabular-nums">
            {filters.dateFrom ? format(filters.dateFrom, "LLL dd", { locale: dateLocale }) : "..."} -{" "}
            {filters.dateTo ? format(filters.dateTo, "LLL dd", { locale: dateLocale }) : "..."}
          </span>
          <button
            type="button"
            className={removeButtonClass}
            onClick={() => onRemove("dateFrom")}
            aria-label={t("removeFilter")}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      )}

      <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 px-2.5 text-xs text-ink-2">
        {t("clearAll")}
      </Button>
    </div>
  );
}
