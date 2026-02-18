"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth/auth";
import { landingNavItems, getIsActive } from "@/lib/navigation";
import { usePathname, useRouter } from "@/i18n/routing";

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

export function useNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const navItems = landingNavItems;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Sign out failed", error);
    }
    router.push("/");
  };

  const scrollToSection = (href: string) => {
    const isOnLandingPage = pathname === "/";

    if (!isOnLandingPage) {
      router.push(href);
      return;
    }

    const hash = href.replace(/^\//, "");
    const targetId = hash.replace(/^#/, "");
    const element = document.getElementById(targetId);

    if (element) {
      window.history.pushState(null, "", hash);
      window.dispatchEvent(new Event("hashchange"));

      element.scrollIntoView({ behavior: "smooth" });

      element.focus({ preventScroll: true });
    }
  };

  const isActive = (href: string) => {
    return getIsActive(pathname, href, hash);
  };

  return {
    user,
    pathname,
    router,
    hash,
    navItems,
    handleSignOut,
    scrollToSection,
    isActive,
  };
}
