"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useTranslations } from "next-intl";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

export function UpgradeBanner() {
  const t = useTranslations("dashboard.components.upgradeBanner");
  const { hasPaidSubscription, loading } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isVisible = useMemo(() => {
    if (loading || hasPaidSubscription) return false;
    return true;
  }, [loading, hasPaidSubscription]);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      await authClient.checkout({ slug: "pay-as-you-go" });
    } catch (error) {
      console.error("Error initiating checkout:", error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUpgrade}
            disabled={checkoutLoading}
            className="mx-auto size-8"
          >
            <Sparkles className="size-4 text-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{t("upgradeNow")}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 shrink-0 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t("description")}</p>
      <Button size="sm" onClick={handleUpgrade} disabled={checkoutLoading} className="mt-3 w-full">
        {t("upgradeNow")}
      </Button>
    </div>
  );
}
