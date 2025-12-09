import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <PageContainer>
      <div className="mb-6">
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="mt-6 space-y-6">
        <Skeleton className="h-10 w-64" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/40 bg-card p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border/40 bg-card p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1 max-w-[200px]" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card p-6">
          <Skeleton className="h-5 w-24 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </PageContainer>
  );
}
