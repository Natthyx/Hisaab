import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}