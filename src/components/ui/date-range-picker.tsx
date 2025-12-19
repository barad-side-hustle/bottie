"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Locale } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  setDate: (date?: DateRange) => void;
  locale?: Locale;
  placeholder?: string;
  showPresets?: boolean;
  presets?: Array<{ label: string; days: number }>;
  title?: string;
}

export function DateRangePicker({
  className,
  date,
  setDate,
  locale,
  placeholder,
  showPresets = false,
  presets,
  title,
}: DateRangePickerProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const numberOfMonths = isMobile ? 1 : 2;

  const defaultPresets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ];

  const activePresets = presets || defaultPresets;

  const handlePreset = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    setDate({ from, to });
    setIsOpen(false);
  };

  const Trigger = (
    <Button
      id="date"
      variant={"outline"}
      className={cn("w-full justify-start text-start font-normal", !date && "text-muted-foreground")}
    >
      <CalendarIcon className="me-2 h-4 w-4 shrink-0" />
      {date?.from ? (
        date.to ? (
          <span className="truncate">
            {format(date.from, "LLL dd, y", { locale })} - {format(date.to, "LLL dd, y", { locale })}
          </span>
        ) : (
          format(date.from, "LLL dd, y", { locale })
        )
      ) : (
        <span>{placeholder || "Pick a date"}</span>
      )}
    </Button>
  );

  const PresetsSection = showPresets ? (
    <div className="flex flex-wrap gap-2 md:flex-col md:gap-0 md:space-y-2">
      {activePresets.map((preset) => (
        <Button
          key={preset.days}
          variant="ghost"
          size="sm"
          className="justify-start"
          onClick={() => handlePreset(preset.days)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  ) : null;

  const CalendarSection = (
    <Calendar
      initialFocus
      mode="range"
      defaultMonth={date?.from}
      selected={date}
      onSelect={(range) => {
        setDate(range);
        if (range?.from && range?.to) {
          setIsOpen(false);
        }
      }}
      numberOfMonths={numberOfMonths}
      locale={locale}
    />
  );

  const MobileCalendarSection = (
    <Calendar
      initialFocus
      mode="range"
      defaultMonth={date?.from}
      selected={date}
      onSelect={(range) => {
        setDate(range);
        if (range?.from && range?.to) {
          setIsOpen(false);
        }
      }}
      numberOfMonths={1}
      locale={locale}
      className="w-full p-0"
      classNames={{
        months: "w-full",
        month: "w-full space-y-4",
        table: "w-full border-collapse",
        head_row: "flex w-full",
        head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2",
        cell: "flex-1 h-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-e-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-s-md last:[&:has([aria-selected])]:rounded-e-md focus-within:relative focus-within:z-20",
        day: "h-10 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
        day_range_end: "day-range-end",
        day_hidden: "invisible",
      }}
    />
  );

  if (isMobile && showPresets) {
    return (
      <div className={cn("grid gap-2", className)}>
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>{Trigger}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-start">
              <DrawerTitle>{title || "Select Date Range"}</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-8 space-y-4">
              {PresetsSection}
              <div className="pt-4">{MobileCalendarSection}</div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{Trigger}</PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {showPresets ? (
            <div className="flex">
              <div className="p-3">{PresetsSection}</div>
              <div className="p-3">{CalendarSection}</div>
            </div>
          ) : (
            CalendarSection
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
