"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { getIsActive, landingNavItems } from "@/lib/navigation";
import { useTranslations } from "next-intl";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot() {
  return window.location.hash;
}

function getServerSnapshot() {
  return "";
}

export function BottomNavigation() {
  const pathname = usePathname();
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = useTranslations();

  const scrollToSection = (href: string) => {
    if (pathname !== "/") return;

    const targetHash = href.replace(/^\//, "");
    const targetId = targetHash.replace(/^#/, "");
    const element = document.getElementById(targetId);

    if (element) {
      window.history.pushState(null, "", targetHash);
      window.dispatchEvent(new Event("hashchange"));
      element.scrollIntoView({ behavior: "smooth" });
      element.focus({ preventScroll: true });
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/60 shadow-lg h-16">
      <div className="flex items-center justify-around h-full px-2">
        {landingNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(pathname, item.href, hash);

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => scrollToSection(item.href)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <Icon className={cn("transition-all", isActive ? "size-6" : "size-5")} />
              <span className={cn("text-xs transition-all", isActive ? "font-semibold" : "font-medium")}>
                {t(item.label)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
