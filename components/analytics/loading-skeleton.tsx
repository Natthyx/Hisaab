import { Skeleton } from "@/components/ui/skeleton"

export function AnalyticsLoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 md:ml-64 md:p-8 md:pb-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          {/* Account Selector */}
          <Skeleton className="h-12 w-full rounded-lg" />
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  )
}