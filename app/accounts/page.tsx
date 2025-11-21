import { Navigation } from "@/components/navigation"
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountsClient } from "@/components/accounts-client"

interface Account {
  id: string
  name: string
  initial_balance: number
  created_at: string
}

export default async function AccountsPage() {
  const supabase = await createClient()
  
  // Get user data
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user's accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('name')
  
  // Get user's default account
  const { data: userData } = await supabase
    .from('users')
    .select('default_account_id')
    .eq('id', user.id)
    .single()
  
  const defaultAccountId = userData?.default_account_id
  
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
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
}