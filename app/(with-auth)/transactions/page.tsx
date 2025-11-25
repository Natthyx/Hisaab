import { ThemeToggle } from '@/components/layout/theme-toggle'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransactionsClient } from "@/components/transactions/client"
import { getTransactionsPageData } from "@/lib/transactions/service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import { getCachedUser } from "@/lib/auth/service"
import { Suspense } from 'react'

async function TransactionsContent(props: { searchParams: Promise<{ account?: string }> }) {
  const searchParams = await props.searchParams
  // Use cached user instead of calling getUser directly
  const user = await getCachedUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get transactions page data using the service function
  const {
    accounts,
    selectedAccountId,
    transactions
  } = await getTransactionsPageData(user.id, searchParams.account)
  
  return (
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
  )
}

export default function TransactionsPage(props: { searchParams: Promise<{ account?: string }> }) {
  return (
    <Suspense fallback={
    <div className="fixed inset-0 flex items-center justify-center bg-background z-[100] overflow-hidden md:left-64 md:top-0 md:bottom-0 md:right-0">
      <div className="flex flex-col items-center gap-4 px-4 w-full max-w-xs sm:max-w-sm">
        <div className="relative">
          <img 
            src="/hisaab-logo-main.png"
            alt="Hisaab Logo" 
            className="h-12 w-12 animate-pulse sm:h-16 sm:w-16"
          />
        </div>
        <div className="h-1.5 w-full max-w-[96px] overflow-hidden rounded-full bg-muted sm:max-w-[128px] sm:h-2">
          <div className="h-full w-full animate-progress rounded-full bg-indigo-600"></div>
        </div>
      </div>
    </div>}>
      <TransactionsContent {...props} />
    </Suspense>
  )
}