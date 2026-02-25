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
    <div className="space-y-6 overflow-y-auto max-h-[60vh]">
      {([5, 4, 3, 2, 1] as const).map((rating) => {
        const starConfig = values[rating];

        return (
          <div key={rating} className="pb-6 last:pb-0 border-b last:border-b-0 border-border/40">
            <div className="mb-3">
              <StarRating rating={rating} size={18} />
            </div>

            <div className="space-y-2">
              <div
                className={cn(
                  "rounded-md border border-input bg-background overflow-hidden",
                  "focus-within:ring-1 focus-within:ring-ring"
                )}
              >
                <div className="px-3 pt-2.5 pb-1">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onChange(rating, {
                        ...starConfig,
                        autoReply: !starConfig.autoReply,
                      })
                    }
                  >
                    <Badge
                      variant={starConfig.autoReply ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer select-none transition-colors gap-1",
                        disabled && "pointer-events-none opacity-50"
                      )}
                    >
                      {starConfig.autoReply ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {t("autoReply.label")}
                    </Badge>
                  </button>
                </div>
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
                  className="text-sm resize-none border-0 shadow-none focus-visible:ring-0 rounded-none"
                />
              </div>
              {rating <= 2 && (
                <p className="text-xs text-muted-foreground text-start">{t("customInstructions.helpers.low")}</p>
              )}
              {rating === 3 && (
                <p className="text-xs text-muted-foreground text-start">{t("customInstructions.helpers.medium")}</p>
              )}
              {rating >= 4 && (
                <p className="text-xs text-muted-foreground text-start">{t("customInstructions.helpers.high")}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
