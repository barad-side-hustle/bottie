"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useRouter } from "@/i18n/routing";
import { getLocaleDir, type Locale } from "@/lib/locale";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale() as Locale;
  const dir = getLocaleDir(locale);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/onboarding/connect-account");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ background: "var(--gradient-soft)" }}
      dir={dir}
    >
      <OnboardingHeader />
      <div className="container max-w-3xl mx-auto py-12 px-4 w-full">{children}</div>
    </div>
  );
}
