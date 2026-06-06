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
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  const t = useTranslations("dashboard.reviews.filters");
  const locale = useLocale();
  const dateLocale = localeMap[locale] || enUS;

  const hasFilters =
    (filters.replyStatus?.length ?? 0) > 0 ||
    (filters.rating?.length ?? 0) > 0 ||
    (filters.sentiment?.length ?? 0) > 0 ||
    filters.dateFrom ||
    filters.dateTo;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mt-4">
      {filters.replyStatus?.map((status) => (
        <Badge key={status} variant="secondary" className="gap-1 ps-2.5 pe-1 py-1">
          {t(`status.${status}`)}
          <button
            type="button"
            className="flex size-4 items-center justify-center rounded-full text-secondary-foreground/70 transition-colors hover:bg-primary/15 hover:text-secondary-foreground"
            onClick={() => onRemove("replyStatus", status)}
            aria-label={t("removeFilter")}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}

      {filters.rating?.map((rating) => (
        <Badge key={rating} variant="secondary" className="gap-1 ps-2.5 pe-1 py-1">
          <span className="inline-flex items-center gap-0.5">
            {rating}
            <Star className="size-3 fill-star-filled text-star-filled" aria-hidden="true" />
          </span>
          <button
            type="button"
            className="flex size-4 items-center justify-center rounded-full text-secondary-foreground/70 transition-colors hover:bg-primary/15 hover:text-secondary-foreground"
            onClick={() => onRemove("rating", rating)}
            aria-label={t("removeFilter")}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}

      {filters.sentiment?.map((sentiment) => (
        <Badge key={sentiment} variant="secondary" className="gap-1 ps-2.5 pe-1 py-1">
          {t(`sentimentValues.${sentiment}`)}
          <button
            type="button"
            className="flex size-4 items-center justify-center rounded-full text-secondary-foreground/70 transition-colors hover:bg-primary/15 hover:text-secondary-foreground"
            onClick={() => onRemove("sentiment", sentiment)}
            aria-label={t("removeFilter")}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}

      {(filters.dateFrom || filters.dateTo) && (
        <Badge variant="secondary" className="gap-1 ps-2.5 pe-1 py-1">
          {filters.dateFrom ? format(filters.dateFrom, "LLL dd", { locale: dateLocale }) : "..."} -{" "}
          {filters.dateTo ? format(filters.dateTo, "LLL dd", { locale: dateLocale }) : "..."}
          <button
            type="button"
            className="flex size-4 items-center justify-center rounded-full text-secondary-foreground/70 transition-colors hover:bg-primary/15 hover:text-secondary-foreground"
            onClick={() => onRemove("dateFrom")}
            aria-label={t("removeFilter")}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </Badge>
      )}

      <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 px-2.5 text-xs">
        {t("clearAll")}
      </Button>
    </div>
  );
}
