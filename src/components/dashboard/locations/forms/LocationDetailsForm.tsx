"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TooltipIcon } from "@/components/ui/tooltip";
import { useTranslations, useLocale } from "next-intl";
import { getLocaleDir, type Locale } from "@/lib/locale";

export interface LocationDetailsFormData {
  name: string;
  description: string;
  phoneNumber: string;
}

interface LocationDetailsFormProps {
  values: LocationDetailsFormData;
  onChange: (field: keyof LocationDetailsFormData, value: string) => void;
  showTooltips?: boolean;
  disabled?: boolean;
  locationNamePlaceholder?: string;
}

export function LocationDetailsForm({
  values,
  onChange,
  showTooltips = true,
  disabled = false,
  locationNamePlaceholder,
}: LocationDetailsFormProps) {
  const t = useTranslations("dashboard.businesses.forms.businessDetails");

  const locale = useLocale() as Locale;
  const dir = getLocaleDir(locale);

  return (
    <div className="space-y-6" dir={dir}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && <TooltipIcon text={t("name.tooltip")} additionalInfoLabel={t("name.label")} />}
          <Label htmlFor="locationName">{t("name.label")}</Label>
        </div>
        <Input
          id="locationName"
          type="text"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder={locationNamePlaceholder || t("name.placeholder")}
          disabled={disabled}
          aria-describedby={locationNamePlaceholder ? "locationName-helper" : undefined}
          dir={dir}
        />
        {locationNamePlaceholder && (
          <p id="locationName-helper" className="text-start text-xs text-ink-3">
            {t("name.helper")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && <TooltipIcon text={t("description.tooltip")} additionalInfoLabel={t("description.label")} />}
          <Label htmlFor="locationDescription">{t("description.label")}</Label>
        </div>
        <Textarea
          id="locationDescription"
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder={t("description.placeholder")}
          rows={4}
          disabled={disabled}
          aria-describedby="locationDescription-helper"
          className="resize-none"
          dir={dir}
        />
        <p id="locationDescription-helper" className="text-start text-xs text-ink-3">
          {t("description.helper")}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && <TooltipIcon text={t("phone.tooltip")} additionalInfoLabel={t("phone.label")} />}
          <Label htmlFor="locationPhone">{t("phone.label")}</Label>
        </div>
        <Input
          id="locationPhone"
          type="tel"
          value={values.phoneNumber}
          onChange={(e) => onChange("phoneNumber", e.target.value)}
          placeholder={t("phone.placeholder")}
          disabled={disabled}
          aria-describedby="locationPhone-helper"
          dir="ltr"
        />
        <p id="locationPhone-helper" className="text-start text-xs text-ink-3">
          {t("phone.helper")}
        </p>
      </div>
    </div>
  );
}
