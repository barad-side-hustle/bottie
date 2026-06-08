import * as React from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Bento = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("grid gap-3", className)} {...props} />
));
Bento.displayName = "Bento";

const BentoCell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col rounded-lg border border-hairline bg-card p-5 sm:p-6", className)}
      {...props}
    />
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
    <BentoCell className={cn("gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-2">{label}</span>
        {Icon && <Icon className={cn("size-4 shrink-0 text-ink-3", iconClassName)} aria-hidden />}
      </div>
      <div className="text-[1.75rem] font-medium leading-tight tracking-tight tabular-nums text-foreground">
        {value}
      </div>
      {(delta !== undefined || hint) && (
        <div className="mt-auto flex items-center gap-2 pt-1">
          {delta !== undefined && <DeltaBadge value={delta} suffix={deltaSuffix} />}
          {hint && <span className="text-xs text-ink-3">{hint}</span>}
        </div>
      )}
    </BentoCell>
  );
}

export { Bento, BentoCell, DeltaBadge, StatTile };
