import { Navigation } from "@/components/layout/navigation"
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { redirect } from 'next/navigation'
import { AddTransactionClient } from "@/components/forms/add-transaction-form"
import { getUserAccountsWithCurrentUser, getUserDefaultAccountForCurrentUser, checkUserHasAccountsWithCurrentUser } from "@/lib/accounts/service"
import { AddTransactionLoadingSkeleton } from "@/components/forms/loading-skeleton"
import { Suspense } from 'react'

export default async function AddTransactionPage() {
  return (
    <Suspense fallback={<AddTransactionLoadingSkeleton />}>
      <AddTransactionContent />
    </Suspense>
  )
}

async function AddTransactionContent() {
  try {
    // Check if user has accounts, redirect to setup if not
    const hasAccounts = await checkUserHasAccountsWithCurrentUser()
    if (!hasAccounts) {
      redirect('/setup')
    }
    
    // Get user's accounts using the service function (user ID handled internally with caching)
    const accounts = await getUserAccountsWithCurrentUser()
    
    // Get user's default account using the service function (user ID handled internally with caching)
    const userData = await getUserDefaultAccountForCurrentUser()
    
    const defaultAccountId = userData?.default_account_id
    
    return (
      <div className="flex min-h-screen flex-col">
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
      </div>
    )
  } catch (error) {
    // If there's an auth error, redirect to login
    redirect('/login')
  }
}