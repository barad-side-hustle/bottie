"use client";

import { useEffect, useRef } from "react";
import { Loading } from "@/components/ui/loading";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { authClient } from "@/lib/auth-client";
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
      try {
        await authClient.checkout({
          slug: "location-plan",
          ...(locationId ? { metadata: { locationId } } : {}),
        });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        router.push("/");
      }
    }

    startCheckout();
  }, [user, router, locationId]);

  return (
    <CheckoutPageLayout>
      <div className="flex flex-col items-center text-center py-8">
        <Loading text={t("processing")} description={t("almostThere")} size="lg" />
      </div>
    </CheckoutPageLayout>
  );
}
