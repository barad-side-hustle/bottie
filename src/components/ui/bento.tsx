import * as React from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Bento = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid gap-px overflow-hidden rounded-3xl border border-border/60 bg-border/60 shadow-sm", className)}
    {...props}
  />
));
Bento.displayName = "Bento";

const BentoCell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col bg-card p-5 sm:p-6", className)} {...props} />
  )
);
BentoCell.displayName = "BentoCell";

interface DeltaBadgeProps {
  value: number;
  suffix?: string;
  className?: string;
}

function DeltaBadge({ value, suffix, className }: DeltaBadgeProps) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums",
        positive ? "text-success" : "text-destructive",
        className
      )}
    >
      <Icon className="size-3.5" />
      {Math.abs(value).toFixed(1)}%
      {suffix ? <span className="ms-1 font-normal text-muted-foreground">{suffix}</span> : null}
    </span>
  );
}

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  delta?: number;
  deltaSuffix?: string;
  hint?: React.ReactNode;
  className?: string;
}

function StatTile({ label, value, icon: Icon, iconClassName, delta, deltaSuffix, hint, className }: StatTileProps) {
  return (
    <BentoCell className={cn("gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary",
              iconClassName
            )}
          >
            <Icon className="size-4.5" />
          </span>
        )}
      </div>
      <div className="text-3xl font-bold tracking-tight tabular-nums">{value}</div>
      {(delta !== undefined || hint) && (
        <div className="mt-auto flex items-center gap-2 pt-1">
          {delta !== undefined && <DeltaBadge value={delta} suffix={deltaSuffix} />}
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
      )}
    </BentoCell>
  );
}

export { Bento, BentoCell, DeltaBadge, StatTile };
