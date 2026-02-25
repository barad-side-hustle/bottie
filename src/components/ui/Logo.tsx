"use client";

import type { Route } from "next";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { BotIconSvg, FullLogoJsx } from "@/lib/brand/logo";

interface SiteLogoProps {
  href: Route;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "icon" | "full";
}

const sizePx = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 52,
};

export function Logo({ href, className, size = "xl", variant = "icon" }: SiteLogoProps) {
  const px = sizePx[size];

  return (
    <Link href={href} className={cn("flex items-center", className)}>
      {variant === "icon" ? <BotIconSvg size={px} /> : <FullLogoJsx height={px} />}
    </Link>
  );
}
