"use client";

import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/auth";

export function OnboardingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("onboarding");
  const tAuth = useTranslations("auth");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const stepMap: Record<string, number> = {
    "/onboarding/connect-account": 1,
    "/onboarding/choose-location": 2,
    "/onboarding/location-details": 3,
    "/onboarding/ai-settings": 4,
    "/onboarding/star-ratings": 5,
  };
  const currentStep = stepMap[pathname] || 1;
  const totalSteps = 5;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Sign out error:", error);
      }
      router.push("/");
    } catch (err) {
      console.error("Unexpected sign out error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="absolute inset-x-0 top-0 z-10 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="icon"
            disabled={isSigningOut}
            aria-label={tAuth("signOut")}
            className="hover:bg-background/50"
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <LanguageSwitcher />
        </div>

        <div>
          <p className="text-sm text-muted-foreground font-medium">
            {t("step", { current: currentStep, total: totalSteps })}
          </p>
        </div>
      </div>
    </div>
  );
}
