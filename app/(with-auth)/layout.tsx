import { Navigation } from "@/components/layout/navigation"
import { PageLoadingIndicator, LoadingProvider } from "@/components/layout/loading-overlay"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LoadingProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Navigation />
        <main className="flex-1 p-4 pb-20 md:ml-64 md:p-8 md:pb-8 relative">
          <PageLoadingIndicator />
          {children}
        </main>
      </div>
    </LoadingProvider>
  )
}