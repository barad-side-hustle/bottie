import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "./dashboard-card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, actionLabel, onAction, icon: Icon }: EmptyStateProps) {
  return (
    <DashboardCard className="items-center">
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center sm:py-16">
        {Icon && (
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Icon className="size-7" />
          </div>
        )}
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-1">
            {actionLabel}
          </Button>
        )}
      </div>
    </DashboardCard>
  );
}
