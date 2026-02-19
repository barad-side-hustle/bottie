"use client";

import { useEffect, useRef } from "react";
import { Loading } from "@/components/ui/loading";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/routing";

export function CheckoutForm() {
  const router = useRouter();
  const t = useTranslations("checkout");
  const { user } = useAuth();
  const hasStartedProcessing = useRef(false);

  useEffect(() => {
    if (hasStartedProcessing.current || !user) return;
    hasStartedProcessing.current = true;

    async function startCheckout() {
      try {
        await authClient.checkout({ slug: "pay-as-you-go" });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        router.push("/");
      }
    }

    startCheckout();
  }, [user, router]);

  return <Loading fullScreen text={t("processing")} description={t("almostThere")} size="lg" />;
}
