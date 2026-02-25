"use client";

import { Location } from "@/lib/types";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Sparkles } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import {
  AIResponseSettingsForm,
  AIResponseSettingsFormData,
} from "@/components/dashboard/locations/forms/AIResponseSettingsForm";
import { useTranslations } from "next-intl";

interface AIResponseSettingsSectionProps {
  location: Location;
  loading?: boolean;
  onSave: (data: Partial<Location>) => Promise<void>;
}

export default function AIResponseSettingsSection({ location, loading, onSave }: AIResponseSettingsSectionProps) {
  const t = useTranslations("dashboard.businesses.sections.aiSettings");
  const tCommon = useTranslations("common");

  const toneOptions: Record<string, string> = {
    professional: t("toneOptions.professional"),
    friendly: t("toneOptions.friendly"),
    formal: t("toneOptions.formal"),
    humorous: t("toneOptions.humorous"),
  };

  const languageOptions: Record<string, string> = {
    "auto-detect": t("languageOptions.autoDetect"),
    hebrew: t("languageOptions.hebrew"),
    english: t("languageOptions.english"),
    spanish: t("languageOptions.spanish"),
  };

  const formData: AIResponseSettingsFormData = {
    toneOfVoice: location.toneOfVoice,
    languageMode: location.languageMode || "auto-detect",
    allowedEmojis: location.allowedEmojis || [],
    maxSentences: location.maxSentences || 2,
    signature: location.signature || "",
  };

  return (
    <EditableSection
      title={t("title")}
      description={t("description")}
      icon={<Sparkles className="h-5 w-5" />}
      modalTitle={t("modalTitle")}
      modalDescription={t("modalDescription")}
      loading={loading}
      data={formData}
      onSave={onSave}
      successMessage={tCommon("saveSuccess")}
      errorMessage={tCommon("saveError")}
      cancelLabel={tCommon("cancel")}
      saveLabel={tCommon("save")}
      savingLabel={tCommon("saving")}
      renderDisplay={() => (
        <>
          <DashboardCardField label={t("fields.toneOfVoice")}>
            <p className="text-sm font-medium">{toneOptions[location.toneOfVoice] || location.toneOfVoice}</p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.languageMode")}>
            <p className="text-sm font-medium">{languageOptions[location.languageMode] || location.languageMode}</p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.emojis")}>
            <p className="text-sm font-medium">
              {location.allowedEmojis?.length ? location.allowedEmojis.join(" ") : t("noEmojis")}
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.maxSentences")}>
            <p className="text-sm font-medium">
              {location.maxSentences || 2} {t("sentencesUnit")}
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.signature")}>
            <p className="text-sm font-medium">{location.signature || t("noSignature")}</p>
          </DashboardCardField>
        </>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <AIResponseSettingsForm values={data} onChange={onChange} disabled={isLoading} />
      )}
    />
  );
}
