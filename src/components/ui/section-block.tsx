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
  muted: "bg-muted/40 text-foreground",
  cream: "bg-surface-2 text-foreground",
  lime: "bg-muted/40 text-foreground",
  pink: "bg-muted/40 text-foreground",
  periwinkle: "bg-muted/40 text-foreground",
  lavender: "bg-muted/40 text-foreground",
  mint: "bg-muted/40 text-foreground",
  peach: "bg-muted/40 text-foreground",
  sky: "bg-surface-2 text-foreground",
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
            "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]",
            inverted ? "text-primary-foreground/80" : "text-accent-text"
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl",
          inverted ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed sm:text-lg",
            inverted ? "text-primary-foreground/75" : "text-ink-2"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
