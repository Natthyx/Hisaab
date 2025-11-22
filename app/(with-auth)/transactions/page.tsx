import { Navigation } from "@/components/layout/navigation"
import { TransactionsClient } from "@/components/transactions/client"
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { PlusIcon } from 'lucide-react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { getTransactionsPageDataForCurrentUser } from "@/lib/transactions/service"
import { TransactionsLoadingSkeleton } from "@/components/transactions/loading-skeleton"
import { Suspense } from "react"
import { redirect } from 'next/navigation'

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  return (
    <Suspense fallback={<TransactionsLoadingSkeleton />}>
      <TransactionsContent searchParams={searchParams} />
    </Suspense>
  )
}

async function TransactionsContent({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const params = await searchParams
  
  try {
    // Get transactions page data using the service function (user ID handled internally with caching)
    const {
      accounts,
      selectedAccountId,
      transactions
    } = await getTransactionsPageDataForCurrentUser(params.account)
    
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Transactions</h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href="/add">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Add Transaction</span>
                  </Button>
                </Link>
              </div>
            </div>
            
            <TransactionsClient 
              initialTransactions={transactions || []} 
              accounts={accounts || []}
              selectedAccountId={selectedAccountId}
            />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    // If there's an auth error, redirect to login
    redirect('/login')
  }
}