import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "./dashboard-card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  bare?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
  bare,
  className,
}: EmptyStateProps) {
  const body = (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-16 text-center", className)}>
      {Icon && <Icon className="size-6 text-ink-3" strokeWidth={1.5} aria-hidden />}
      <div className="space-y-1">
        <h3 className="text-base font-medium tracking-tight text-foreground">{title}</h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-2">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );

  if (bare) return body;
  return <DashboardCard>{body}</DashboardCard>;
}
