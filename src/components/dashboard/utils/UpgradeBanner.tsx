"use client";

import { useEffect, useRef, useState, createElement } from "react";
import { sileo } from "sileo";
import { useSubscription } from "@/hooks/use-subscription";
import { useTranslations } from "next-intl";
import { useDirection } from "@/contexts/DirectionProvider";
import { authClient } from "@/lib/auth-client";
import { ArrowLeft } from "lucide-react";

export function UpgradeBanner() {
  const t = useTranslations("dashboard.components.upgradeBanner");
  const { hasPaidSubscription, loading } = useSubscription();
  const { dir } = useDirection();
  const [, setCheckoutLoading] = useState(false);
  const hasShown = useRef(false);

  useEffect(() => {
    if (loading || hasPaidSubscription || hasShown.current) return;
    hasShown.current = true;

    sileo.action({
      title: t("title"),
      description: t("description"),
      duration: 10000,
      ...(dir === "rtl" && { icon: createElement(ArrowLeft, { size: 16 }) }),
      button: {
        title: t("upgradeNow"),
        onClick: async () => {
          setCheckoutLoading(true);
          try {
            await authClient.checkout({ slug: "pay-as-you-go" });
          } catch (error) {
            console.error("Error initiating checkout:", error);
          } finally {
            setCheckoutLoading(false);
          }
        },
      },
    });
  }, [loading, hasPaidSubscription, t, dir]);

  return null;
}
