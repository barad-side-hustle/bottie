"use client";

import { useEffect, useRef, createElement } from "react";
import { sileo } from "sileo";
import { useLocationSubscriptions } from "@/hooks/use-subscription";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { useTranslations } from "next-intl";
import { useDirection } from "@/contexts/DirectionProvider";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

export function UpgradeBanner() {
  const t = useTranslations("dashboard.components.upgradeBanner");
  const { isLocationPaid, loading } = useLocationSubscriptions();
  const currentLocation = useCurrentLocation();
  const locationId = currentLocation?.locationId;
  const { dir } = useDirection();
  const router = useRouter();
  const hasShown = useRef(false);

  const currentLocationPaid = locationId ? isLocationPaid(locationId) : true;

  useEffect(() => {
    if (loading || currentLocationPaid || hasShown.current || !locationId) return;
    hasShown.current = true;

    sileo.action({
      title: t("title"),
      description: t("description"),
      duration: 10000,
      ...(dir === "rtl" && { icon: createElement(ArrowLeft, { size: 16 }) }),
      button: {
        title: t("upgradeNow"),
        onClick: () => {
          router.push("/dashboard/subscription");
        },
      },
    });
  }, [loading, currentLocationPaid, locationId, t, dir, router]);

  return null;
}
