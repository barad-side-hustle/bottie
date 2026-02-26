"use client";

import { useRouter } from "next/navigation";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateUserSettings } from "@/lib/actions/users.actions";

interface UserSettings {
  emailOnNewReview: boolean;
}

interface SettingsFormProps {
  initialSettings: UserSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const t = useTranslations("dashboard.accountSettings");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const handleSaveSettings = async (data: UserSettings) => {
    await updateUserSettings(data);
    router.refresh();
  };

  return (
    <EditableSection
      title={t("title")}
      description={t("description")}
      icon={<Settings className="h-5 w-5" />}
      modalTitle={t("title")}
      modalDescription={t("description")}
      loading={false}
      data={initialSettings}
      onSave={handleSaveSettings}
      successMessage={t("saveSuccess")}
      errorMessage={t("saveError")}
      cancelLabel={tCommon("cancel")}
      saveLabel={tCommon("save")}
      savingLabel={tCommon("saving")}
      renderDisplay={() => (
        <>
          <DashboardCardField
            label={t("emailNotifications.label")}
            value={
              <Badge variant={initialSettings.emailOnNewReview ? "default" : "secondary"}>
                {initialSettings.emailOnNewReview ? t("emailNotifications.enabled") : t("emailNotifications.disabled")}
              </Badge>
            }
          />
        </>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">{t("emailNotifications.title")}</h4>
              <p className="text-xs text-muted-foreground">{t("emailNotifications.description")}</p>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label htmlFor="emailOnNewReview" className="text-sm font-medium cursor-pointer">
                  {t("emailNotifications.label")}
                </Label>
                <p className="text-xs text-muted-foreground">{t("emailNotifications.tooltip")}</p>
              </div>
              <Switch
                id="emailOnNewReview"
                checked={data.emailOnNewReview}
                onCheckedChange={(checked) => onChange("emailOnNewReview", checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    />
  );
}
