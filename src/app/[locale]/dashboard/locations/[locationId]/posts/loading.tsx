import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard, DashboardCardContent, DashboardCardHeader } from "@/components/ui/dashboard-card";

export default function PostsLoading() {
  return (
    <PageContainer>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="mt-6 space-y-6">
        <DashboardCard>
          <DashboardCardHeader>
            <Skeleton className="h-6 w-32" />
          </DashboardCardHeader>
          <DashboardCardContent className="pt-0 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-[100px] w-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </DashboardCardContent>
        </DashboardCard>

        {[1, 2, 3].map((i) => (
          <DashboardCard key={i}>
            <DashboardCardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-4 w-3/4 max-w-sm mt-1" />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </DashboardCardContent>
          </DashboardCard>
        ))}
      </div>
    </PageContainer>
  );
}
