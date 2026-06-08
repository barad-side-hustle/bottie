import { Link } from "@/i18n/routing";
import { Info, TriangleAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CenteredErrorStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: "error" | "warning" | "info";
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const defaultIcons = {
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
};

const iconColorVariants = {
  error: "text-destructive",
  warning: "text-warning-foreground",
  info: "text-info-foreground",
};

export function CenteredErrorState({
  title,
  description,
  icon,
  variant = "error",
  actionLabel,
  actionHref,
  onAction,
}: CenteredErrorStateProps) {
  const IconComponent = defaultIcons[variant];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-hairline bg-card px-6 py-12 text-center sm:px-10">
          <div className={cn("flex items-center justify-center", iconColorVariants[variant])}>
            {icon || <IconComponent className="size-6" strokeWidth={1.5} aria-hidden="true" />}
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-medium tracking-tight text-foreground">{title}</h2>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-2">{description}</p>
          </div>

          {actionLabel && (actionHref || onAction) && (
            <div className="mt-2 w-full">
              {actionHref ? (
                <Button asChild className="w-full">
                  <Link href={actionHref}>{actionLabel}</Link>
                </Button>
              ) : (
                <Button onClick={onAction} className="w-full">
                  {actionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
