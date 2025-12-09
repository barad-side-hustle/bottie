"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, subDays, type Locale } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

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

  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ from: Date; to: Date }>({
    from: dateFrom,
    to: dateTo,
  });

  const presets = [
    { label: t("last7Days"), days: 7 },
    { label: t("last30Days"), days: 30 },
    { label: t("last90Days"), days: 90 },
  ];

  const applyDateRange = (from: Date, to: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("dateFrom", from.toISOString().split("T")[0]);
    params.set("dateTo", to.toISOString().split("T")[0]);
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const handlePreset = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    setSelectedRange({ from, to });
    applyDateRange(from, to);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(dateFrom, "MMM d, yyyy", { locale: dateLocale })} -{" "}
            {format(dateTo, "MMM d, yyyy", { locale: dateLocale })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="border-r p-3 space-y-2">
              {presets.map((preset) => (
                <Button
                  key={preset.days}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handlePreset(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-3">
              <Calendar
                mode="range"
                selected={{ from: selectedRange.from, to: selectedRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setSelectedRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
                disabled={{ after: new Date() }}
                locale={dateLocale}
              />
              <div className="flex justify-end gap-2 pt-3 border-t mt-3">
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => applyDateRange(selectedRange.from, selectedRange.to)}
                  disabled={!selectedRange.from || !selectedRange.to}
                >
                  {t("apply")}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
