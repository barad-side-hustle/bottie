"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";

interface UpgradeButtonProps {
  locationId: string;
  size?: "default" | "sm" | "lg";
}

export function UpgradeButton({ locationId, size = "lg" }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("dashboard.subscription");

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await authClient.checkout({
        slug: "location-plan",
        metadata: { locationId },
      });
    } catch (error) {
      console.error("Error initiating checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} size={size} disabled={loading}>
      {t("upgradePlan")}
    </Button>
  );
}
