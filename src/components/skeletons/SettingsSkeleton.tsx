import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardCard, DashboardCardHeader, DashboardCardContent } from "@/components/ui/dashboard-card";

export function SettingsSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="max-w-2xl space-y-6">
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5 rounded-md" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="size-9 shrink-0 rounded-md" />
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}
