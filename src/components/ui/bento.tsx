import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeltaBadgeProps {
  value: number;
  suffix?: string;
  className?: string;
}

export function DeltaBadge({ value, suffix, className }: DeltaBadgeProps) {
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
