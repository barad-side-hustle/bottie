import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";

export function DashboardHomeSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="space-y-10">
        <section className="flex flex-col gap-5 border-b border-hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Skeleton className="h-14 w-20 sm:h-16" />
            <div className="flex flex-col gap-2 pb-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-11 w-36 shrink-0 rounded-md" />
        </section>

        <section className="grid grid-cols-2 gap-y-6 divide-hairline sm:grid-cols-4 sm:gap-y-0 sm:divide-x">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2.5 px-5 py-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-14" />
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-4" />
          </div>

          <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
            <div className="divide-y divide-hairline">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                  <Skeleton className="size-9 shrink-0 rounded-md" />
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="size-4 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
