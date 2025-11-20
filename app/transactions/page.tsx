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

export default async function TransactionsPage() {
  const supabase = await createClient()
  
  // Get user data
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching transactions:', error)
    // Handle error appropriately
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
                  Add Transaction
                </Button>
              </Link>
            </div>
          </div>
          
          <TransactionsClient initialTransactions={transactions || []} />
        </div>
      </main>
    </div>
  )
}