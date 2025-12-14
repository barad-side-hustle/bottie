"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/ui/Logo";
import { NavbarContainer } from "./NavbarContainer";
import { useNavigation } from "@/hooks/use-navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/auth";

export function UnifiedNavbar({ variant }: { variant: "landing" | "dashboard" }) {
  const { navItems, scrollToSection, isActive } = useNavigation(variant);
  const t = useTranslations();
  const { user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

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

          if (variant === "landing" && item.href.startsWith("/#")) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => scrollToSection(item.href)}
                className={`relative text-sm font-medium px-4 py-2 rounded-lg cursor-pointer ${
                  isItemActive ? "text-gray-900 font-semibold" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {t(item.label)}
                {isItemActive && (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    className="absolute bottom-1 inset-x-0 h-[2px] bg-primary rounded-full mx-2"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative text-sm font-medium px-4 py-2 rounded-lg cursor-pointer ${
                isItemActive ? "text-gray-900 font-semibold" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {t(item.label)}
              {isItemActive && (
                <motion.div
                  layoutId="navbar-active-indicator"
                  className="absolute bottom-1 inset-x-0 h-[2px] bg-primary rounded-full mx-2"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 shrink-0 pe-2">
        {variant === "landing" && user ? (
          <>
            <div className="md:hidden flex items-center gap-1">
              <Link href="/dashboard/home" onClick={() => setIsNavigating(true)}>
                <Button variant="ghost" size="icon" disabled={isNavigating} aria-label={t("auth.myAccount")}>
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
              <Link href="/dashboard/home" onClick={() => setIsNavigating(true)}>
                <Button variant="default" size="sm" disabled={isNavigating}>
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
