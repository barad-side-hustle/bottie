import * as React from "react";
import { cn } from "@/lib/utils";

export type SectionTone =
  | "plain"
  | "muted"
  | "cream"
  | "lime"
  | "pink"
  | "periwinkle"
  | "lavender"
  | "mint"
  | "peach"
  | "sky"
  | "primary";

const toneClasses: Record<SectionTone, string> = {
  plain: "bg-background text-foreground",
  muted: "bg-muted/50 text-foreground",
  cream: "bg-pastel-cream text-foreground",
  lime: "bg-pastel-lime text-foreground",
  pink: "bg-pastel-pink text-foreground",
  periwinkle: "bg-pastel-periwinkle text-foreground",
  lavender: "bg-pastel-lavender text-foreground",
  mint: "bg-pastel-mint text-foreground",
  peach: "bg-pastel-peach text-foreground",
  sky: "bg-pastel-sky text-foreground",
  primary: "bg-primary text-primary-foreground",
};

interface SectionBlockProps extends React.HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  width?: "sm" | "md" | "lg" | "xl";
  containerClassName?: string;
}

const widthClasses: Record<NonNullable<SectionBlockProps["width"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export function SectionBlock({
  tone = "plain",
  width = "lg",
  className,
  containerClassName,
  children,
  ...props
}: SectionBlockProps) {
  return (
    <section className={cn("w-full", toneClasses[tone], className)} {...props}>
      <div
        className={cn("mx-auto w-full px-4 py-20 sm:px-6 md:py-28 lg:px-8", widthClasses[width], containerClassName)}
      >
        {children}
      </div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "start";
  inverted?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  inverted = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-start",
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
            inverted ? "bg-primary-foreground/15 text-primary-foreground" : "bg-brand/10 text-brand"
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl",
          inverted ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed sm:text-lg",
            inverted ? "text-primary-foreground/75" : "text-muted-foreground"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
