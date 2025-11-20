import { ThemeToggle } from '@/components/theme-toggle'
import { Navigation } from "@/components/navigation"
import { BalanceCard } from "@/components/balance-card"
import { ExpenseChart } from "@/components/expense-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import Link from "next/link"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Helper function to format dates for daily chart
const formatDailyDate = (dateString: string) => {
  const date = new Date(dateString)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days[date.getDay()]
}

// Helper function to format dates for weekly chart
const formatWeeklyDate = (dateString: string, index: number) => {
  return `Week ${index + 1}`
}

// Helper function to format dates for monthly chart
const formatMonthlyDate = (dateString: string) => {
  const date = new Date(dateString)
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
  return months[date.getMonth()]
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get user data
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user's initial balance
  const { data: userData } = await supabase
    .from('users')
    .select('initial_balance')
    .eq('id', user.id)
    .single()
  
  // Get transactions for analytics
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
  
  // Calculate income and expense
  let totalIncome = 0
  let totalExpense = 0
  
  transactions?.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount
    } else {
      totalExpense += transaction.amount
    }
  })
  
  const balance = (userData?.initial_balance || 0) + totalIncome - totalExpense
  
  // Generate daily chart data (Mon-Sun)
  const dailyData = []
  const now = new Date()
  const firstDayOfWeek = new Date(now)
  firstDayOfWeek.setDate(now.getDate() - now.getDay())
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(firstDayOfWeek)
    day.setDate(firstDayOfWeek.getDate() + i)
    
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)
    
    let dayIncome = 0
    let dayExpense = 0
    
    transactions?.forEach(transaction => {
      const transactionDate = new Date(transaction.date)
      if (transactionDate >= dayStart && transactionDate <= dayEnd) {
        if (transaction.type === 'income') {
          dayIncome += transaction.amount
        } else {
          dayExpense += transaction.amount
        }
      }
    })
    
    dailyData.push({
      day: formatDailyDate(dayStart.toISOString()),
      income: dayIncome,
      expense: dayExpense
    })
  }
  
  // Generate weekly chart data (Week 1 - Week 4)
  const weeklyData = []
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  const weeksInMonth = Math.ceil((endOfMonth.getDate() - startOfMonth.getDate() + 1) / 7)
  
  for (let i = 0; i < Math.min(weeksInMonth, 4); i++) { // Limit to 4 weeks
    const weekStart = new Date(startOfMonth)
    weekStart.setDate(startOfMonth.getDate() + (i * 7))
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    if (weekEnd > endOfMonth) weekEnd.setTime(endOfMonth.getTime())
    
    const weekTransactions = transactions?.filter(t => 
      new Date(t.date) >= weekStart && new Date(t.date) <= weekEnd
    ) || []
    
    let weekIncome = 0
    let weekExpense = 0
    
    weekTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        weekIncome += transaction.amount
      } else {
        weekExpense += transaction.amount
      }
    })
    
    weeklyData.push({
      week: formatWeeklyDate(weekStart.toISOString(), i),
      income: weekIncome,
      expense: weekExpense
    })
  }
  
  // Generate monthly chart data (Sep - Aug)
  const monthlyData = []
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(startOfYear.getFullYear(), i, 1)
    const monthEnd = new Date(startOfYear.getFullYear(), i + 1, 0, 23, 59, 59, 999)
    
    const monthTransactions = transactions?.filter(t => 
      new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
    ) || []
    
    let monthIncome = 0
    let monthExpense = 0
    
    monthTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        monthIncome += transaction.amount
      } else {
        monthExpense += transaction.amount
      }
    })
    
    monthlyData.push({
      month: formatMonthlyDate(monthStart.toISOString()),
      income: monthIncome,
      expense: monthExpense
    })
  }
  
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Dashboard</h1>
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

          <BalanceCard balance={balance} income={totalIncome} expense={totalExpense} />

          <Tabs defaultValue="daily">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="mt-6">
              <ExpenseChart
                data={dailyData}
                title="Daily Overview"
                type="bar"
                dataKeys={[
                  { key: "income", color: "#10b981", label: "Income" },
                  { key: "expense", color: "#ef4444", label: "Expense" },
                ]}
                xAxisKey="day"
              />
            </TabsContent>
            <TabsContent value="weekly" className="mt-6">
              <ExpenseChart
                data={weeklyData}
                title="Weekly Overview"
                type="line"
                dataKeys={[
                  { key: "income", color: "#10b981", label: "Income" },
                  { key: "expense", color: "#ef4444", label: "Expense" },
                ]}
                xAxisKey="week"
              />
            </TabsContent>
            <TabsContent value="monthly" className="mt-6">
              <ExpenseChart
                data={monthlyData}
                title="Monthly Overview"
                type="bar"
                dataKeys={[
                  { key: "income", color: "#10b981", label: "Income" },
                  { key: "expense", color: "#ef4444", label: "Expense" },
                ]}
                xAxisKey="month"
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}