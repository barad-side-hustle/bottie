"use client";

import { Location } from "@/lib/types";
import { Building2 } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import {
  LocationDetailsForm,
  LocationDetailsFormData,
} from "@/components/dashboard/locations/forms/LocationDetailsForm";
import { useTranslations } from "next-intl";

interface LocationIdentitySectionProps {
  location: Location;
  loading?: boolean;
  onSave: (data: Partial<Location>) => Promise<void>;
}

export default function LocationIdentitySection({ location, loading, onSave }: LocationIdentitySectionProps) {
  const t = useTranslations("dashboard.businesses.sections.identity");
  const tCommon = useTranslations("common");

  const formData: LocationDetailsFormData = {
    name: location.name || "",
    description: location.description || "",
    phoneNumber: location.phoneNumber || "",
  };

  return (
    <EditableSection
      title={t("title")}
      description={t("description")}
      icon={<Building2 className="h-5 w-5" />}
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
        <dl className="space-y-4">
          <div className="flex items-start justify-between gap-6 border-b border-hairline pb-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-2">{t("fields.name")}</dt>
            <dd className="text-end text-sm font-medium text-foreground">{location.name}</dd>
          </div>

          <div className="space-y-1.5 border-b border-hairline pb-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-2">{t("fields.description")}</dt>
            <dd className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {location.description || <span className="text-ink-3">{t("noDescription")}</span>}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-6">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-2">{t("fields.phone")}</dt>
            <dd className="text-end text-sm font-medium tabular-nums text-foreground">
              {location.phoneNumber || <span className="text-ink-3">{t("noPhone")}</span>}
            </dd>
          </div>
        </dl>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <LocationDetailsForm
          values={data}
          onChange={onChange}
          disabled={isLoading}
          locationNamePlaceholder={location.name}
        />
      )}
    />
  );
}
