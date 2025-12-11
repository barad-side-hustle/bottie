"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type Locale } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { DateRangePicker } from "@/components/ui/date-range-picker";

const localeMap: Record<string, Locale> = {
  he,
  en: enUS,
};

interface InsightsDateFilterProps {
  dateFrom: Date;
  dateTo: Date;
}

export function InsightsDateFilter({ dateFrom, dateTo }: InsightsDateFilterProps) {
  const t = useTranslations("dashboard.insights.dateFilter");
  const locale = useLocale();
  const dateLocale = localeMap[locale] || enUS;
  const router = useRouter();
  const searchParams = useSearchParams();

  const presets = [
    { label: t("last7Days"), days: 7 },
    { label: t("last30Days"), days: 30 },
    { label: t("last90Days"), days: 90 },
  ];

  const handleDateChange = (range?: { from?: Date; to?: Date }) => {
    if (range?.from && range?.to) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("dateFrom", range.from.toISOString().split("T")[0]);
      params.set("dateTo", range.to.toISOString().split("T")[0]);
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <DateRangePicker
      date={{ from: dateFrom, to: dateTo }}
      setDate={handleDateChange}
      locale={dateLocale}
      showPresets
      presets={presets}
      title={t("selectDateRange")}
      className="w-full md:w-auto"
    />
  );
}
