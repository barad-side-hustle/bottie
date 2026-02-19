"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatarDropdown } from "@/components/auth/UserAvatarDropdown";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface AuthButtonProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function AuthButton({ size = "sm", className }: AuthButtonProps) {
  const { user, loading } = useAuth();
  const t = useTranslations("auth");

  if (loading) {
    return <Skeleton className="h-8 w-20 rounded-md" />;
  }

  if (user) {
    return <UserAvatarDropdown />;
  }

  return (
    <Link href="/login">
      <Button size={size} className={className}>
        {t("login")}
      </Button>
    </Link>
  );
}
