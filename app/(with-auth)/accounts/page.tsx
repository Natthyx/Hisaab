import { Navigation } from "@/components/layout/navigation"
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { AccountsClient } from "@/components/accounts/client"
import { getUserAccountsWithCurrentUser, getUserDefaultAccountForCurrentUser } from "@/lib/accounts/service"
import { AccountsLoadingSkeleton } from "@/components/accounts/loading-skeleton"
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export default async function AccountsPage() {
  return (
    <Suspense fallback={<AccountsLoadingSkeleton />}>
      <AccountsContent />
    </Suspense>
  )
}

async function AccountsContent() {
  try {
    // Get user's accounts using the service function (user ID handled internally with caching)
    const accounts = await getUserAccountsWithCurrentUser()
    
    // Get user's default account using the service function (user ID handled internally with caching)
    const userData = await getUserDefaultAccountForCurrentUser()
    
    const defaultAccountId = userData?.default_account_id
    
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Accounts</h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
            
            <AccountsClient 
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