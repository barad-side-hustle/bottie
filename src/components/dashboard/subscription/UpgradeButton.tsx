"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("dashboard.subscription");

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await authClient.checkout({ slug: "pay-as-you-go" });
    } catch (error) {
      console.error("Error initiating checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} size="lg" disabled={loading}>
      {t("upgradePlan")}
    </Button>
  );
}
