import { ThemeToggle } from '@/components/layout/theme-toggle'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransactionsClient } from "@/components/transactions/client"
import { getTransactionsPageData } from "@/lib/transactions/service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import { getCachedUser } from "@/lib/auth/service"

export default async function TransactionsPage(props: { searchParams: Promise<{ account?: string }> }) {
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