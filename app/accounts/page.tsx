import { Navigation } from "@/components/layout/navigation"
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountsClient } from "@/components/accounts/client"
import { getUserAccounts, getUserDefaultAccount } from "@/lib/accounts/service"

export default async function AccountsPage() {
  const supabase = await createClient()
  
  // Get user data
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user's accounts using the service function
  const accounts = await getUserAccounts(user.id)
  
  // Get user's default account using the service function
  const userData = await getUserDefaultAccount(user.id)
  
  const defaultAccountId = userData?.default_account_id
  
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 p-4 pb-20 md:ml-64 md:p-8 md:pb-8">
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
}