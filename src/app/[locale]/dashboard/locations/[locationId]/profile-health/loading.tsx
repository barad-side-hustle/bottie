import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileHealthLoading() {
  return (
    <PageContainer>
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-col items-center gap-5 rounded-lg border border-hairline bg-card p-6 text-center">
            <Skeleton className="size-[168px] rounded-full" />
            <div className="space-y-2">
              <Skeleton className="mx-auto h-5 w-32" />
              <Skeleton className="mx-auto h-4 w-40" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-card">
          <div className="divide-y divide-hairline">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <Skeleton className="mt-0.5 size-4 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-40 flex-1" />
                    <Skeleton className="h-3 w-16 shrink-0" />
                    <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
