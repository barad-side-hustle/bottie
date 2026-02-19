"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function UpgradeBanner() {
  const t = useTranslations("dashboard.components.upgradeBanner");
  const { hasPaidSubscription, loading } = useSubscription();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isVisible = useMemo(() => {
    if (loading || hasPaidSubscription) return false;
    return true;
  }, [loading, hasPaidSubscription]);

  const handleUpgrade = () => {
    router.push("/");
  };

  if (!isVisible) {
    return null;
  }

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleUpgrade} className="mx-auto size-8">
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
      <Button size="sm" onClick={handleUpgrade} className="mt-3 w-full">
        {t("upgradeNow")}
      </Button>
    </div>
  );
}
