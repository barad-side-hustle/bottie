"use client";

import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";
import { getLocaleDir, type Locale } from "@/lib/locale";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const locale = useLocale() as Locale;
  const dir = getLocaleDir(locale);

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

  return <div dir={dir}>{children}</div>;
}
