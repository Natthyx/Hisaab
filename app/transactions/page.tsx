import { Navigation } from "@/components/navigation"
import { TransactionsClient } from "@/components/transactions-client"
import { ThemeToggle } from '@/components/theme-toggle'
import { PlusIcon } from 'lucide-react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  reason: string
  category: string
  date: string
}

interface Account {
  id: string
  name: string
}

export default async function TransactionsPage(props: { searchParams: Promise<{ account?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  
  // Get user data
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user's accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name')
  
  // Determine which account to show
  let selectedAccountId = searchParams.account
  
  // If no account specified, use user's default account or first account
  if (!selectedAccountId && accounts && accounts.length > 0) {
    // Get user's default account
    const { data: userData } = await supabase
      .from('users')
      .select('default_account_id')
      .eq('id', user.id)
      .single()
    
    if (userData?.default_account_id) {
      selectedAccountId = userData.default_account_id
    } else {
      selectedAccountId = accounts[0].id
    }
  }
  
  // Get transactions for the selected account
  let transactions = []
  if (selectedAccountId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', selectedAccountId)
      .order('date', { ascending: false })
    
    if (error) {
      console.error('Error fetching transactions:', error)
      // Handle error appropriately
    }
    
    transactions = data || []
  }
  
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
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
    </div>
  )
}