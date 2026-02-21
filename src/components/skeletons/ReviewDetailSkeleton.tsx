import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";

export function ReviewDetailSkeleton() {
  return (
    <PageContainer>
      <div className="mb-6">
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="space-y-1">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="mt-6">
        <div className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <div className="border-s-2 border-primary/30 ps-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-1">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md ms-2" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
