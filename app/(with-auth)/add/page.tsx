import { ThemeToggle } from '@/components/layout/theme-toggle'
import { redirect } from 'next/navigation'
import { AddTransactionClient } from "@/components/forms/add-transaction-form"
import { getUserAccounts, getUserDefaultAccount } from "@/lib/accounts/service"
import { getCachedUser } from "@/lib/auth/service"
import { Suspense } from 'react'
import { PageLoadingIndicator } from '@/components/layout/loading-overlay'

async function AddTransactionContent() {
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

export default function AddTransactionPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-background z-[100] overflow-hidden md:left-64 md:top-0 md:bottom-0 md:right-0">
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
      <AddTransactionContent />
    </Suspense>
  )
}