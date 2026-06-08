import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-surface-2 text-ink-2",
        accent: "border-transparent bg-accent-tint text-accent-text",
        brand: "border-transparent bg-accent-tint text-accent-text",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-negative-tint text-destructive",
        outline: "border-hairline text-ink-2",
        warning: "border-transparent bg-pending-tint text-warning-foreground",
        success: "border-transparent bg-positive-tint text-success-foreground",
        info: "border-transparent bg-notice-tint text-info-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
export type { BadgeProps };
