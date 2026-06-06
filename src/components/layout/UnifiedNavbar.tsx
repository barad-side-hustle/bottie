"use client";

import { Link } from "@/i18n/routing";
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

  return (
    <NavbarContainer>
      <div className="shrink-0">
        <Logo href="/" variant="full" size="md" />
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isItemActive = isActive(item.href);
          const itemClass = cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            isItemActive ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
          <Button asChild className="rounded-full">
            <Link href="/dashboard/home">{t("auth.dashboard")}</Link>
          </Button>
        ) : (
          <AuthButton size="default" className="rounded-full" />
        )}
      </div>
    </NavbarContainer>
  );
}
