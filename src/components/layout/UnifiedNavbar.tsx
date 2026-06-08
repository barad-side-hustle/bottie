"use client";

import { useTransition } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { Logo } from "@/components/ui/Logo";
import { NavbarContainer } from "./NavbarContainer";
import { useNavigation } from "@/hooks/use-navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UnifiedNavbar() {
  const { navItems, scrollToSection, isActive } = useNavigation();
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();

  return (
    <NavbarContainer>
      <div className="shrink-0">
        <Logo href="/" variant="full" size="md" />
      </div>

      <nav className="hidden md:flex items-center gap-6">
        {navItems.map((item) => {
          const isItemActive = isActive(item.href);
          const itemClass = cn(
            "text-sm transition-colors cursor-pointer underline-offset-8 decoration-1",
            isItemActive ? "text-foreground font-medium underline" : "text-ink-2 hover:text-foreground"
          );

          if (item.href.startsWith("/#")) {
            return (
              <button key={item.label} type="button" onClick={() => scrollToSection(item.href)} className={itemClass}>
                {t(item.label)}
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={itemClass}>
              {t(item.label)}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 shrink-0">
        {user ? (
          <Button loading={navigating} onClick={() => startNavigation(() => router.push("/dashboard/home"))}>
            {t("auth.dashboard")}
          </Button>
        ) : (
          <AuthButton size="default" />
        )}
      </div>
    </NavbarContainer>
  );
}
