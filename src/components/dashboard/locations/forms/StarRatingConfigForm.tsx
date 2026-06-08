"use client";

import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/StarRating";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Location } from "@/lib/types";
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
    <div className="max-h-[60vh] divide-y divide-border overflow-y-auto">
      {([5, 4, 3, 2, 1] as const).map((rating) => {
        const starConfig = values[rating];
        const switchId = `auto-reply-${rating}`;
        const helperId = `instructions-helper-${rating}`;
        const helperText =
          rating <= 2
            ? t("customInstructions.helpers.low")
            : rating === 3
              ? t("customInstructions.helpers.medium")
              : t("customInstructions.helpers.high");

        return (
          <div key={rating} className="space-y-3 py-5 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <StarRating rating={rating} size={18} />
              <div className="flex items-center gap-2">
                <Label htmlFor={switchId} className="text-ink-2">
                  {t("autoReply.label")}
                </Label>
                <Switch
                  id={switchId}
                  checked={starConfig.autoReply}
                  disabled={disabled}
                  onCheckedChange={(checked) =>
                    onChange(rating, {
                      ...starConfig,
                      autoReply: checked,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
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
                aria-describedby={helperId}
                className="resize-none text-sm"
              />
              <p id={helperId} className="text-start text-xs text-ink-3">
                {helperText}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
