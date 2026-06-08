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
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 rounded-lg border border-hairline bg-card px-3 py-2.5 shadow-md sm:px-4">
        <span className="text-sm font-medium text-foreground">
          <span className="me-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-surface-3 px-1.5 text-xs font-semibold tabular-nums text-foreground">
            {selectedCount}
          </span>
          {t("selected")}
        </span>

        {!isAllSelected && totalPublishableCount > selectedCount && (
          <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-8 gap-1.5 rounded-md text-xs">
            <CheckSquare className="size-3.5" />
            {t("selectAll", { count: totalPublishableCount })}
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={onDeselectAll} className="h-8 gap-1.5 rounded-md text-xs">
          <X className="size-3.5" />
          {t("deselectAll")}
        </Button>

        <div className="h-5 w-px bg-hairline" />

        <Button size="sm" onClick={onBulkPublish} className="gap-1.5 rounded-md">
          <Send className="size-3.5" />
          {t("publishSelected", { count: selectedCount })}
        </Button>
      </div>
    </div>
  );
}
