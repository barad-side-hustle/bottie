import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";

export function DashboardHomeSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-1 mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <DashboardCard key={i}>
            <DashboardCardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Skeleton className="h-3 w-20 mb-3" />
                  <Skeleton className="h-7 w-12" />
                </div>
                <Skeleton className="size-11 rounded-xl shrink-0" />
              </div>
            </DashboardCardContent>
          </DashboardCard>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/40 p-4 mb-6">
        <Skeleton className="size-5 rounded-full shrink-0" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <DashboardCard key={i}>
              <DashboardCardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-32 mb-1.5" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  {i === 1 && <Skeleton className="h-5 w-20 rounded-full" />}
                </div>
              </DashboardCardContent>
            </DashboardCard>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
