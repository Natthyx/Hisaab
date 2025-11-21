import { Navigation } from "@/components/layout/navigation"
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { PlusIcon } from 'lucide-react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsClient } from "@/components/analytics/client"
import { getAccountTransactions } from "@/lib/transactions/service"
import { getUserAccounts, getUserDefaultAccount } from "@/lib/accounts/service"

interface Account {
  id: string
  name: string
  initial_balance: number
}

export default async function AnalyticsPage(props: { searchParams: Promise<{ account?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  
  // Get user data
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user's accounts using the service function
  const accounts = await getUserAccounts(user.id)
  
  // Determine which account to show
  let selectedAccountId = searchParams.account
  
  // If no account specified, use user's default account or first account
  if (!selectedAccountId && accounts && accounts.length > 0) {
    // Get user's default account using the service function
    const userData = await getUserDefaultAccount(user.id)
    
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
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 p-4 pb-20 md:ml-64 md:p-8 md:pb-8">
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
}