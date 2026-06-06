"use client";

import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/StarRating";
import { Textarea } from "@/components/ui/textarea";
import { Location } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

export type StarRatingConfigFormData = Location["starConfigs"];

interface StarRatingConfigFormProps {
  values: StarRatingConfigFormData;
  onChange: (rating: 1 | 2 | 3 | 4 | 5, config: { autoReply: boolean; customInstructions: string }) => void;
  disabled?: boolean;
}

export function StarRatingConfigForm({ values, onChange, disabled = false }: StarRatingConfigFormProps) {
  const t = useTranslations("dashboard.businesses.forms.starRatings");

  return (
    <div className="max-h-[60vh] space-y-3 overflow-y-auto">
      {([5, 4, 3, 2, 1] as const).map((rating) => {
        const starConfig = values[rating];

        return (
          <div key={rating} className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <StarRating rating={rating} size={18} />
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange(rating, {
                    ...starConfig,
                    autoReply: !starConfig.autoReply,
                  })
                }
                aria-pressed={starConfig.autoReply}
              >
                <Badge
                  variant={starConfig.autoReply ? "success" : "muted"}
                  className={cn(
                    "cursor-pointer select-none gap-1 transition-colors",
                    disabled && "pointer-events-none opacity-50"
                  )}
                >
                  {starConfig.autoReply ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {t("autoReply.label")}
                </Badge>
              </button>
            </div>

            <div className="space-y-2">
              <Textarea
                id={`instructions-${rating}`}
                value={starConfig.customInstructions}
                onChange={(e) =>
                  onChange(rating, {
                    ...starConfig,
                    customInstructions: e.target.value,
                  })
                }
                placeholder={t("customInstructions.placeholder")}
                rows={3}
                disabled={disabled}
                className="resize-none text-sm"
              />
              {rating <= 2 && (
                <p className="text-start text-xs text-muted-foreground">{t("customInstructions.helpers.low")}</p>
              )}
              {rating === 3 && (
                <p className="text-start text-xs text-muted-foreground">{t("customInstructions.helpers.medium")}</p>
              )}
              {rating >= 4 && (
                <p className="text-start text-xs text-muted-foreground">{t("customInstructions.helpers.high")}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
