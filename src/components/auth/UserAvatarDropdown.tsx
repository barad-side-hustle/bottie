"use client";

import { LogOut, Plus, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";

export function UserAvatarDropdown() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("auth");

  const isDashboardPage = pathname?.startsWith("/dashboard");

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Sign out failed", error);
    }
    router.push("/");
  };

  const handleAddBusiness = () => {
    router.push("/onboarding");
  };

  const handleDashboard = () => {
    router.push("/dashboard/home");
  };

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return null;
  }

  const displayName = user.name;
  const photoURL = user.image;

  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage src={photoURL || undefined} alt={displayName || "User"} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 text-start">
            <p className="text-sm font-medium leading-none text-foreground">{displayName || t("user")}</p>
            <p className="text-xs leading-none text-ink-2">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isDashboardPage && (
          <DropdownMenuItem onSelect={handleDashboard}>
            <LayoutDashboard className="h-4 w-4 text-ink-3" />
            <span>{t("dashboard")}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={handleAddBusiness}>
          <Plus className="h-4 w-4 text-ink-3" />
          <span>{t("addBusiness")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut className="h-4 w-4 text-ink-3" />
          <span>{t("signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
