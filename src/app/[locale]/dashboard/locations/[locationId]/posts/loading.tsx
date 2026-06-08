import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard, DashboardCardContent, DashboardCardHeader } from "@/components/ui/dashboard-card";

export default function PostsLoading() {
  return (
    <PageContainer>
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <DashboardCard>
            <DashboardCardHeader>
              <Skeleton className="h-6 w-32" />
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-4 pt-0">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-28 w-full rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 w-32 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </DashboardCardContent>
          </DashboardCard>
        </div>

        <DashboardCard>
          <DashboardCardHeader className="pb-0">
            <Skeleton className="h-6 w-28" />
          </DashboardCardHeader>
          <DashboardCardContent className="pt-4">
            <div className="divide-y divide-hairline">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-4 first:pt-0">
                  <Skeleton className="size-12 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="ms-auto h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex items-center gap-1 pt-1">
                      <Skeleton className="size-8 rounded-md" />
                      <Skeleton className="size-8 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}
