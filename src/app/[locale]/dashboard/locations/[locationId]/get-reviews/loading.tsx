import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard } from "@/components/ui/dashboard-card";

export default function GetReviewsLoading() {
  return (
    <PageContainer>
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="mt-6 space-y-4">
        <DashboardCard className="overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="flex flex-col items-center justify-center gap-4 border-b border-hairline bg-surface-2 p-6 sm:p-8 lg:border-b-0 lg:border-e">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="size-64 rounded-md" />
            </div>

            <div className="flex min-w-0 flex-col p-4 sm:p-6">
              <Skeleton className="h-9 w-full rounded-md" />
              <div className="mt-6 space-y-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-hairline pt-4">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            </div>
          </div>
        </DashboardCard>

        <section className="rounded-lg border border-hairline bg-card p-4 sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="mt-4 divide-y divide-hairline border-t border-hairline">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
