"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Building2, Star, MessageSquare } from "lucide-react";
import { OnboardingFormPanel } from "@/components/onboarding/OnboardingFormPanel";
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
      nextButton={{
        label: t("connectButton"),
        loadingLabel: t("connectingButton"),
        onClick: handleConnect,
        loading: connecting,
      }}
    >
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">{t("permissionsTitle")}</p>
        <div className="flex flex-wrap gap-2">
          {permissions.map((perm) => (
            <div
              key={perm.label}
              className="inline-flex items-center gap-2 rounded-full bg-pastel-lavender/20 border border-border/40 px-4 py-2 text-sm text-muted-foreground"
            >
              <perm.icon className="h-4 w-4 text-primary shrink-0" />
              <span>{perm.label}</span>
            </div>
          ))}
        </div>
      </div>
    </OnboardingFormPanel>
  );
}
