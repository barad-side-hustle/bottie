"use client";

import { Location } from "@/lib/types";
import { Bot } from "lucide-react";
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
      icon={<Bot className="h-5 w-5" />}
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
        <dl className="divide-y divide-hairline">
          <div className="flex items-start justify-between gap-6 py-2.5 first:pt-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-2">{t("fields.toneOfVoice")}</dt>
            <dd className="text-end text-sm font-medium text-foreground">
              {toneOptions[location.toneOfVoice] || location.toneOfVoice}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-6 py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-2">{t("fields.languageMode")}</dt>
            <dd className="text-end text-sm font-medium text-foreground">
              {languageOptions[location.languageMode] || location.languageMode}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-6 py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-2">{t("fields.emojis")}</dt>
            <dd className="text-end text-sm font-medium text-foreground">
              {location.allowedEmojis?.length ? location.allowedEmojis.join(" ") : t("noEmojis")}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-6 py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-2">{t("fields.maxSentences")}</dt>
            <dd className="text-end text-sm font-medium tabular-nums text-foreground">
              {location.maxSentences || 2} {t("sentencesUnit")}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-6 py-2.5 last:pb-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-2">{t("fields.signature")}</dt>
            <dd className="text-end text-sm font-medium text-foreground">{location.signature || t("noSignature")}</dd>
          </div>
        </dl>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <AIResponseSettingsForm values={data} onChange={onChange} disabled={isLoading} />
      )}
    />
  );
}
