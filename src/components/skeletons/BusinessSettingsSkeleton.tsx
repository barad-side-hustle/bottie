import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardCard, DashboardCardHeader, DashboardCardContent } from "@/components/ui/dashboard-card";

export function BusinessSettingsSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="space-y-6">
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-md" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-4 w-72" />
          </DashboardCardHeader>
          <DashboardCardContent className="-my-2 divide-y divide-hairline">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-md" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
              </div>
            ))}
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-md" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-4 w-64" />
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-56" />
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-72" />
              </div>
              <Skeleton className="h-9 w-32 shrink-0 rounded-md" />
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}
