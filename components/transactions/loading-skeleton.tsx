import { Skeleton } from "@/components/ui/skeleton"

export function TransactionsLoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 md:ml-64 md:p-8 md:pb-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
          
          {/* Transactions List */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32 rounded-md" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </main>
    </div>
  )
}