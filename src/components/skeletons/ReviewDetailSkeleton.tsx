import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";

export function ReviewDetailSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-2">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="mt-6 max-w-3xl">
        <div className="overflow-hidden rounded-lg border border-hairline bg-card">
          <div className="flex flex-col">
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

            <div className="flex items-center gap-2 border-t border-hairline bg-card px-5 py-3">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="ms-auto h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
