"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Loading } from "@/components/ui/loading";

interface RedirectToOnboardingProps {
  href: string;
}

export function RedirectToOnboarding({ href }: RedirectToOnboardingProps) {
  const router = useRouter();

  useEffect(() => {
    router.push(href);
  }, [router, href]);

  return <Loading fullScreen />;
}
