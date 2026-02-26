"use client";

import { Button } from "@/components/ui/button";
import { Send, X, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface BulkActionBarProps {
  selectedCount: number;
  totalPublishableCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkPublish: () => void;
}

export function BulkActionBar({
  selectedCount,
  totalPublishableCount,
  isAllSelected,
  onSelectAll,
  onDeselectAll,
  onBulkPublish,
}: BulkActionBarProps) {
  const t = useTranslations("dashboard.reviews.bulkActions");

  return (
    <div
      className={cn(
        "fixed bottom-4 inset-x-0 z-50 flex justify-center pointer-events-none",
        "animate-in slide-in-from-bottom-4 fade-in duration-200"
      )}
    >
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-lg px-3 sm:px-4 py-2.5 shadow-lg">
        <span className="text-sm font-medium tabular-nums">
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold me-1.5">
            {selectedCount}
          </span>
          {t("selected")}
        </span>

        {!isAllSelected && totalPublishableCount > selectedCount && (
          <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-7 gap-1.5 text-xs">
            <CheckSquare className="size-3.5" />
            {t("selectAll", { count: totalPublishableCount })}
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={onDeselectAll} className="h-7 gap-1.5 text-xs">
          <X className="size-3.5" />
          {t("deselectAll")}
        </Button>

        <div className="h-5 w-px bg-border/60" />

        <Button size="sm" onClick={onBulkPublish} className="gap-1.5">
          <Send className="size-3.5" />
          {t("publishSelected", { count: selectedCount })}
        </Button>
      </div>
    </div>
  );
}
