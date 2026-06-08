"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/auth";

interface OnboardingLayoutProps {
  formPanel: ReactNode;
}

export function OnboardingLayout({ formPanel }: OnboardingLayoutProps) {
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await signOut();
      if (error) console.error("Sign out error:", error);
      router.push("/");
    } catch (err) {
      console.error("Unexpected sign out error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="icon"
            disabled={isSigningOut}
            aria-label={tAuth("signOut")}
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-1 flex items-stretch justify-center px-4 sm:px-8 pb-12">
        <div className="w-full max-w-2xl mx-auto flex">
          <div className="bg-surface rounded-lg border border-hairline p-6 sm:p-10 flex flex-col flex-1">
            {formPanel}
          </div>
        </div>
      </main>
    </div>
  );
}
