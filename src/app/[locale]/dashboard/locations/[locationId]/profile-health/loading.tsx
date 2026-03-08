import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard } from "@/components/ui/dashboard-card";

export default function ProfileHealthLoading() {
  return (
    <PageContainer>
      <div className="mb-4">
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="space-y-2 mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-96" />
      </div>

      <DashboardCard className="mb-8">
        <div className="p-6">
          <div className="flex items-center gap-6">
            <Skeleton className="size-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <DashboardCard key={i}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-4 w-full mt-3" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
          </DashboardCard>
        ))}
      </div>

      <DashboardCard>
        <div className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-5 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
