import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-1">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pb-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-surface rounded-lg border border-hairline p-6 sm:p-8">
            <div className="flex flex-col items-center gap-6 py-6">
              <Skeleton className="h-12 w-12" />
              <div className="space-y-2 flex flex-col items-center">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
