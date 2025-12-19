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

const iconContainerVariants = {
  error: "bg-destructive/10 text-destructive",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
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
        <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10 text-center">
          <div
            className={cn(
              "mx-auto flex h-12 w-12 items-center justify-center rounded-full",
              iconContainerVariants[variant]
            )}
          >
            {icon || <IconComponent className="h-6 w-6" aria-hidden="true" />}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-foreground">{title}</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">{description}</p>

          {actionLabel && (actionHref || onAction) && (
            <div className="mt-6">
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
