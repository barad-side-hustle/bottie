import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";

export function ReviewsListSkeleton() {
  return (
    <PageContainer className="max-w-[1440px] space-y-0">
      <div className="space-y-2">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-hairline bg-card lg:h-[calc(100vh-12rem)] lg:min-h-[600px]">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(320px,2fr)_minmax(0,3fr)]">
          <div className="flex min-h-0 flex-col lg:border-e lg:border-hairline">
            <div className="flex flex-col gap-3 border-b border-hairline p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-40 rounded-md" />
                <Skeleton className="ms-auto h-8 w-20 rounded-md" />
              </div>
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ReviewRows />
            </div>
          </div>

          <aside className="hidden min-h-0 lg:flex lg:flex-col">
            <ReviewDetailBody />
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}

function ReviewRows() {
  return (
    <div className="flex flex-col gap-2 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-hairline p-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="ms-auto h-3 w-12" />
          </div>
          <Skeleton className="mt-2 h-3 w-20" />
          <div className="mt-2.5 space-y-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
          <Skeleton className="mt-2.5 h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function ReviewDetailBody() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-hairline px-2 py-1.5">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="ms-auto h-5 w-20 rounded-full" />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex items-start gap-3 p-5">
          <Skeleton className="mt-0.5 h-10 w-10 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-hairline" />

        <div className="space-y-2 p-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="h-px w-full bg-hairline" />

        <div className="space-y-2 p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-40 w-full rounded-md" />
          <div className="flex items-center justify-end">
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-hairline bg-card px-5 py-3">
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}
