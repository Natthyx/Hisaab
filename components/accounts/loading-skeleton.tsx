import { Skeleton } from "@/components/ui/skeleton"

export function AccountsLoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 md:ml-64 md:p-8 md:pb-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          {/* Accounts List */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
          
          {/* Create Account Form */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}