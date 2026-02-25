import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-soft)" }}>
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pb-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card rounded-3xl border border-border/40 shadow-lg p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 py-8">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex flex-col items-center">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
