import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard, DashboardCardHeader, DashboardCardContent } from "@/components/ui/dashboard-card";

interface OnboardingSkeletonProps {
  variant?: "default" | "connect-account" | "star-ratings";
}

export function OnboardingSkeleton({ variant = "default" }: OnboardingSkeletonProps) {
  return (
    <div>
      <DashboardCard>
        <DashboardCardHeader>
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </DashboardCardHeader>

        <DashboardCardContent className="space-y-6">
          {variant === "connect-account" && <ConnectAccountContent />}
          {variant === "star-ratings" && <StarRatingsContent />}
          {variant === "default" && <DefaultContent />}

          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}

function DefaultContent() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

function ConnectAccountContent() {
  return (
    <div className="rounded-2xl border border-border/40 p-6 space-y-4">
      <Skeleton className="h-5 w-48 mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <Skeleton className="h-4 flex-1 mt-2" />
        </div>
      ))}
    </div>
  );
}

function StarRatingsContent() {
  return (
    <div className="space-y-6">
      {[5, 4, 3, 2, 1].map((rating) => (
        <div key={rating} className="pb-6 last:pb-0 border-b last:border-b-0 border-border/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
