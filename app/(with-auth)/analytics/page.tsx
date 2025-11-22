import { Navigation } from "@/components/layout/navigation"
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { PlusIcon } from 'lucide-react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { AnalyticsClient } from "@/components/analytics/client"
import { getAccountTransactions } from "@/lib/transactions/service"
import { getUserAccountsWithCurrentUser, getUserDefaultAccountForCurrentUser } from "@/lib/accounts/service"
import { AnalyticsLoadingSkeleton } from "@/components/analytics/loading-skeleton"
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  return (
    <Suspense fallback={<AnalyticsLoadingSkeleton />}>
      <AnalyticsContent searchParams={searchParams} />
    </Suspense>
  )
}

async function AnalyticsContent({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const params = await searchParams
  
  try {
    // Get user's accounts using the service function (user ID handled internally with caching)
    const accounts = await getUserAccountsWithCurrentUser()
    
    // Determine which account to show
    let selectedAccountId = params.account
    
    // If no account specified, use user's default account or first account
    if (!selectedAccountId && accounts && accounts.length > 0) {
      // Get user's default account using the service function (user ID handled internally with caching)
      const userData = await getUserDefaultAccountForCurrentUser()
      
      if (userData?.default_account_id) {
        selectedAccountId = userData.default_account_id
      } else {
        selectedAccountId = accounts[0].id
      }
    }
    
    // Get selected account details
    const selectedAccount = selectedAccountId 
      ? accounts?.find(account => account.id === selectedAccountId) || accounts?.[0]
      : accounts?.[0]
    
    // Get transactions for the selected account using the service function
    const transactions = selectedAccountId 
      ? await getAccountTransactions(selectedAccountId) 
      : []
    
    // Get account's initial balance
    const initialBalance = selectedAccount?.initial_balance || 0
    
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Analytics</h1>
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
            
            <AnalyticsClient 
              transactions={transactions || []}
              initialBalance={initialBalance}
              accounts={accounts || []}
              selectedAccount={selectedAccount}
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