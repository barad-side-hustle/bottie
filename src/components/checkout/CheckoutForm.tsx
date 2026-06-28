"use client";

import { useEffect, useRef } from "react";
import { Loading } from "@/components/ui/loading";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { createLocationCheckout } from "@/lib/actions/checkout.actions";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { CheckoutPageLayout } from "@/components/checkout/CheckoutPageLayout";

export function CheckoutForm() {
  const router = useRouter();
  const t = useTranslations("checkout");
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const hasStartedProcessing = useRef(false);

  const locationId = searchParams.get("locationId");

  useEffect(() => {
    if (hasStartedProcessing.current || !user) return;
    hasStartedProcessing.current = true;

    async function startCheckout() {
      if (!locationId) {
        router.push("/");
        return;
      }
      try {
        const url = await createLocationCheckout(locationId);
        window.location.href = url;
      } catch (error) {
        console.error("Error creating checkout session:", error);
        router.push("/");
      }
    }

    startCheckout();
  }, [user, router, locationId]);

  return (
    <CheckoutPageLayout>
      <div className="flex flex-col items-center gap-6 text-center py-6">
        <Loading size="lg" />
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">{t("processing")}</h1>
          <p className="text-sm text-muted-foreground">{t("almostThere")}</p>
        </div>
      </div>
    </CheckoutPageLayout>
  );
}
