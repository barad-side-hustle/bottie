"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/ui/Logo";
import { NavbarContainer } from "./NavbarContainer";
import { useNavigation } from "@/hooks/use-navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/auth";

export function UnifiedNavbar() {
  const { navItems, scrollToSection, isActive } = useNavigation();
  const t = useTranslations();
  const { user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <NavbarContainer>
      <div className="shrink-0 ps-2">
        <Logo href="/dashboard/home" />
      </div>

      <nav className="hidden md:flex items-center flex-1 justify-center h-full gap-1">
        {navItems.map((item) => {
          const isItemActive = isActive(item.href);

          if (item.href.startsWith("/#")) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => scrollToSection(item.href)}
                className={`relative text-sm font-medium px-4 py-2 rounded-lg cursor-pointer ${
                  isItemActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(item.label)}
                {isItemActive && <div className="absolute bottom-1 inset-x-0 h-[2px] bg-primary rounded-full mx-2" />}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative text-sm font-medium px-4 py-2 rounded-lg cursor-pointer ${
                isItemActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(item.label)}
              {isItemActive && <div className="absolute bottom-1 inset-x-0 h-[2px] bg-primary rounded-full mx-2" />}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 shrink-0 pe-2">
        {user ? (
          <>
            <div className="md:hidden flex items-center gap-1">
              <Link href="/dashboard/home">
                <Button variant="ghost" size="icon" aria-label={t("auth.myAccount")}>
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                disabled={isSigningOut}
                aria-label={t("auth.signOut")}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard/home">
                <Button variant="default" size="sm">
                  {t("auth.myAccount")}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
                {t("auth.signOut")}
              </Button>
            </div>
          </>
        ) : (
          <AuthButton />
        )}
      </div>
    </NavbarContainer>
  );
}
