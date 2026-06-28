"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { createLocationCheckout } from "@/lib/actions/checkout.actions";

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
      const url = await createLocationCheckout(locationId);
      window.location.href = url;
    } catch (error) {
      console.error("Error initiating checkout:", error);
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} size={size} disabled={loading}>
      {t("upgradePlan")}
    </Button>
  );
}
