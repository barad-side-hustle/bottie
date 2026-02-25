"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/auth";

interface CheckoutPageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function CheckoutPageLayout({ children, showHeader = true }: CheckoutPageLayoutProps) {
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
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-soft)" }}>
      {showHeader && (
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-7xl mx-auto w-full">
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
        </header>
      )}

      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pb-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card rounded-3xl border border-border/40 shadow-lg p-6 sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
