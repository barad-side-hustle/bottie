"use client";

import { Location } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { StarRatingConfigForm } from "@/components/dashboard/locations/forms/StarRatingConfigForm";
import { useTranslations } from "next-intl";

interface StarRatingConfigSectionProps {
  starConfigs: Location["starConfigs"];
  loading?: boolean;
  onSave: (starConfigs: Location["starConfigs"]) => Promise<void>;
}

export default function StarRatingConfigSection({ starConfigs, loading, onSave }: StarRatingConfigSectionProps) {
  const t = useTranslations("dashboard.businesses.sections.starRatings");
  const tCommon = useTranslations("common");

  return (
    <EditableSection
      title={t("title")}
      description={t("description")}
      icon={<Star className="h-5 w-5" />}
      modalTitle={t("modalTitle")}
      modalDescription={t("modalDescription")}
      loading={loading}
      data={starConfigs}
      onSave={(configs) => onSave(configs as Location["starConfigs"])}
      successMessage={tCommon("saveSuccess")}
      errorMessage={tCommon("saveError")}
      cancelLabel={tCommon("cancel")}
      saveLabel={tCommon("save")}
      savingLabel={tCommon("saving")}
      renderDisplay={() => (
        <div className="space-y-3">
          {([5, 4, 3, 2, 1] as const).map((rating) => {
            const starConfig = starConfigs[rating];

            return (
              <div key={rating} className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <StarRating rating={rating} size={18} />
                  <Badge variant={starConfig.autoReply ? "success" : "muted"}>
                    {t("autoReply")} {starConfig.autoReply ? t("enabled") : t("disabled")}
                  </Badge>
                </div>

                {starConfig.customInstructions ? (
                  <p className="whitespace-pre-wrap rounded-xl bg-muted/60 p-3.5 text-sm leading-relaxed">
                    {starConfig.customInstructions}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">{t("noInstructions")}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <StarRatingConfigForm values={data} onChange={onChange} disabled={isLoading} />
      )}
    />
  );
}
