import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-56 rounded-md" />
      </div>

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 divide-y divide-hairline rounded-lg border border-hairline bg-card sm:grid-cols-3 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col justify-center gap-2.5 p-5 sm:p-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        <div className="rounded-lg border border-hairline bg-card p-6">
          <Skeleton className="mb-4 h-5 w-40" />
          <Skeleton className="h-72 w-full rounded-md" />
        </div>
      </div>
    </PageContainer>
  );
}
