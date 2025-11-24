import { ThemeToggle } from '@/components/layout/theme-toggle'
import { redirect } from 'next/navigation'
import { AddTransactionClient } from "@/components/forms/add-transaction-form"
import { getUserAccounts, getUserDefaultAccount } from "@/lib/accounts/service"
import { getCachedUser } from "@/lib/auth/service"

export default async function AddTransactionPage() {
  // Use cached user instead of calling getUser directly
  const user = await getCachedUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user's accounts using the service function
  const accounts = await getUserAccounts(user.id)
  
  // Get user's default account using the service function
  const userData = await getUserDefaultAccount(user.id)
  
  const defaultAccountId = userData?.default_account_id
  
  // If user has no accounts, redirect to setup
  if (!accounts || accounts.length === 0) {
    redirect('/setup')
  }

  return (
    <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Add Transaction</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        
        <AddTransactionClient 
          accounts={accounts || []} 
          defaultAccountId={defaultAccountId || null} 
        />
      </div>
    </main>
  )
}