import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardContent,
  DashboardCardSection,
  DashboardCardFooter,
} from "@/components/ui/dashboard-card";

export function ReviewsListSkeleton() {
  return (
    <PageContainer>
      <div className="mb-6">
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="space-y-1">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="lg:flex lg:gap-6 mt-6">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="lg:hidden">
            <Skeleton className="h-9 w-24" />
          </div>

          {[1, 2, 3].map((index) => (
            <DashboardCard key={index}>
              <DashboardCardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="min-w-0">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </DashboardCardHeader>

              <DashboardCardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {index !== 3 && (
                  <DashboardCardSection>
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="border-s-2 border-primary/30 ps-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </DashboardCardSection>
                )}
              </DashboardCardContent>

              {index <= 2 && (
                <DashboardCardFooter>
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-20" />
                </DashboardCardFooter>
              )}
            </DashboardCard>
          ))}
        </div>

        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-20">
            <DashboardCard>
              <DashboardCardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-5 rounded" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </DashboardCardHeader>
              <DashboardCardContent className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    {i <= 3 ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Skeleton className="h-9 w-full rounded-md" />
                    )}
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </DashboardCardContent>
            </DashboardCard>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
