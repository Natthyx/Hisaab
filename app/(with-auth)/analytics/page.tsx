import { ThemeToggle } from '@/components/layout/theme-toggle'
import { redirect } from 'next/navigation'
import { 
  getUserAccounts, 
  getUserDefaultAccount
} from "@/lib/accounts/service"
import { getAccountTransactions } from "@/lib/transactions/service"
import { AnalyticsClient } from "@/components/analytics/client"
import { getCachedUser } from "@/lib/auth/service"

interface Account {
  id: string
  name: string
  initial_balance: number
}

interface Transaction {
  id: string
  amount: number
  reason: string
  type: 'income' | 'expense'
  category: string
  date: string
  account_id: string
}

export default async function AnalyticsPage(props: { searchParams: Promise<{ account?: string }> }) {
  const searchParams = await props.searchParams
  // Use cached user instead of calling getUser directly
  const user = await getCachedUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user's accounts using the service function
  const accounts: Account[] = await getUserAccounts(user.id)
  
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
  const transactions: Transaction[] = selectedAccountId 
    ? await getAccountTransactions(selectedAccountId) 
    : []
  
  // Get account's initial balance
  const initialBalance = selectedAccount?.initial_balance || 0
  
  return (
    <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
  )
}