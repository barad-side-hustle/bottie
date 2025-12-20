"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function SubscriptionSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("dashboard.subscription");

  useEffect(() => {
    const success = searchParams.get("success");

    if (success === "true") {
      toast.success(t("successMessage"));

      const params = new URLSearchParams(searchParams);
      params.delete("success");

      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router, t]);

  return null;
}
