import { Skeleton } from "@/components/ui/skeleton"

export function DashboardLoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile Navigation Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
        <div className="flex h-16 items-center justify-around">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-5 rounded-full" />
          ))}
        </div>
      </div>
      
      {/* Desktop Navigation Skeleton */}
      <div className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:border-r md:border-t-0 md:block">
        <div className="flex flex-col gap-1 p-2">
          <Skeleton className="h-8 w-24 mb-4 mt-2" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
          <Skeleton className="h-10 w-full rounded-lg mt-auto mb-4" />
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 md:ml-64 md:p-8 md:pb-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          {/* Balance Card */}
          <Skeleton className="h-32 w-full rounded-xl" />
          
          {/* Tabs */}
          <div className="space-y-6">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 flex-1" />
              ))}
            </div>
            
            {/* Chart Area */}
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  )
}