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
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 border-t border-border bg-background">
      <div className="flex h-full items-stretch justify-around px-2">
        {landingNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(pathname, item.href, hash);

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => scrollToSection(item.href)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150 ease-[var(--ease-standard)]",
                isActive ? "text-foreground" : "text-ink-2 hover:text-foreground"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 top-0 h-0.5 rounded-full transition-colors duration-150 ease-[var(--ease-standard)]",
                  isActive ? "bg-foreground" : "bg-transparent"
                )}
              />
              <Icon className="size-5" />
              <span className={cn("text-xs", isActive ? "font-medium" : "font-normal")}>{t(item.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
