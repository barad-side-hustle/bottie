"use client";

import { Link } from "@/i18n/routing";
import { Logo } from "@/components/ui/Logo";
import { NavbarContainer } from "./NavbarContainer";
import { useNavigation } from "@/hooks/use-navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UnifiedNavbar() {
  const { navItems, scrollToSection, isActive } = useNavigation();
  const t = useTranslations();
  const { user } = useAuth();

  return (
    <NavbarContainer>
      <div className="shrink-0 ps-2">
        <Logo href="/" />
      </div>

      <nav className="hidden md:flex items-center flex-1 justify-center h-full gap-1">
        {navItems.map((item) => {
          const isItemActive = isActive(item.href);
          const itemClass = cn(
            "relative text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors",
            isItemActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
          );

          if (item.href.startsWith("/#")) {
            return (
              <button key={item.label} type="button" onClick={() => scrollToSection(item.href)} className={itemClass}>
                {t(item.label)}
                {isItemActive && <div className="absolute bottom-1 inset-x-0 h-[2px] bg-primary rounded-full mx-2" />}
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={itemClass}>
              {t(item.label)}
              {isItemActive && <div className="absolute bottom-1 inset-x-0 h-[2px] bg-primary rounded-full mx-2" />}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 shrink-0 pe-2">
        {user ? (
          <>
            <Link href="/dashboard/home" className="md:hidden">
              <Button variant="ghost" size="icon" aria-label={t("auth.dashboard")}>
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/dashboard/home" className="hidden md:block">
              <Button size="sm">{t("auth.dashboard")}</Button>
            </Link>
          </>
        ) : (
          <AuthButton />
        )}
      </div>
    </NavbarContainer>
  );
}
