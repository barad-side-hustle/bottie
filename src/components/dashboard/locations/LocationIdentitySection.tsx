"use client";

import { Location } from "@/lib/types";
import { DashboardCardField } from "@/components/ui/dashboard-card";
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
        <>
          <DashboardCardField label={t("fields.name")}>
            <p className="text-sm font-medium">{location.name}</p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.description")}>
            <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
              {location.description || t("noDescription")}
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.phone")}>
            <p className="text-sm font-medium">{location.phoneNumber || t("noPhone")}</p>
          </DashboardCardField>
        </>
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
