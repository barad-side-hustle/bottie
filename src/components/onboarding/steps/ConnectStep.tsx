"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Building2, Star, MessageSquare } from "lucide-react";
import { OnboardingFormPanel } from "@/components/onboarding/OnboardingFormPanel";
import { GoogleSsoButton } from "@/components/ui/google-sso-button";
import { sendRybbitEvent } from "@/lib/analytics";

interface ConnectStepProps {
  progressBar: React.ReactNode;
}

export function ConnectStep({ progressBar }: ConnectStepProps) {
  const router = useRouter();
  const t = useTranslations("onboarding.connectAccount");
  const tCommon = useTranslations("onboarding.common");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    sendRybbitEvent("google_account_connected");
    window.location.href = "/api/google/auth?onboarding=true";
  };

  const permissions = [
    { icon: Building2, label: t("permissions.businessList") },
    { icon: Star, label: t("permissions.readReviews") },
    { icon: MessageSquare, label: t("permissions.publishReplies") },
  ];

  return (
    <OnboardingFormPanel
      title={t("title")}
      description={t("description")}
      progressBar={progressBar}
      backButton={{
        onClick: () => router.push("/dashboard/home"),
        label: tCommon("back"),
      }}
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-hairline bg-surface-2 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.02em] text-ink-2">{t("permissionsTitle")}</p>
          <ul className="space-y-2.5">
            {permissions.map((perm) => (
              <li key={perm.label} className="flex items-center gap-2.5 text-sm text-foreground">
                <perm.icon className="h-4 w-4 shrink-0 text-ink-3" />
                <span>{perm.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <GoogleSsoButton
          onClick={handleConnect}
          isLoading={connecting}
          label={t("connectButton")}
          labelLoading={t("connectingButton")}
          className="h-12 text-base"
        />
      </div>
    </OnboardingFormPanel>
  );
}
