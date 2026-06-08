import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";

export function ReviewsListSkeleton() {
  return (
    <PageContainer className="max-w-[1440px] space-y-0">
      <div className="space-y-2">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="sticky top-14 z-30 -mx-4 mt-4 border-b border-hairline bg-paper px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="ms-auto h-9 w-9 rounded-md" />
        </div>
      </div>

      <div className="mt-4 lg:mt-0">
        <div className="hidden lg:grid lg:grid-cols-[minmax(360px,1fr)_minmax(440px,520px)]">
          <div className="min-w-0 border-e border-hairline">
            <ReviewRows compact />
          </div>
          <aside className="min-w-0">
            <div className="sticky top-32 h-[calc(100vh-9rem)] overflow-hidden rounded-lg border border-hairline bg-card">
              <ReviewDetailBody />
            </div>
          </aside>
        </div>

        <div className="lg:hidden">
          <ReviewRows />
        </div>
      </div>
    </PageContainer>
  );
}

function ReviewRows({ compact }: { compact?: boolean } = {}) {
  return (
    <div
      className={
        compact
          ? "divide-y divide-border overflow-hidden bg-card"
          : "divide-y divide-border overflow-hidden rounded-lg border border-hairline bg-card"
      }
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3">
          <Skeleton className="mt-0.5 h-9 w-9 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="ms-auto h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewDetailBody() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="space-y-5 p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-10 w-10 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="ms-auto h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="space-y-2 border-t border-hairline pt-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-40 w-full rounded-md" />
            <div className="flex items-center justify-end">
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-hairline bg-card px-5 py-3">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="ms-auto h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}
