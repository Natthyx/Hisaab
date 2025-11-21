import { Navigation } from "@/components/navigation"
import { AnalyticsCard } from "@/components/analytics-card"
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  DollarSignIcon, 
  PieChartIcon,
  CalendarIcon,
  AlertCircleIcon,
  LightbulbIcon,
  PlusIcon
} from 'lucide-react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  MoneyFlowChart,
  CategoryBreakdownChart,
  MonthlyTrendsChart,
  BalanceOverTimeChart
} from "@/components/analytics-charts"

interface Account {
  id: string
  name: string
  initial_balance: number
}

// Helper functions for date formatting
const formatDailyDate = (dateString: string) => {
  const date = new Date(dateString)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[date.getDay()]
}

const formatWeeklyDate = (dateString: string, index: number) => {
  return `Week ${index + 1}`
}

const formatMonthlyDate = (dateString: string) => {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[date.getMonth()]
}

const formatYearlyDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.getFullYear().toString()
}

// Helper function to calculate savings rate
const calculateSavingsRate = (income: number, expense: number) => {
  if (income === 0) return 0
  return ((income - expense) / income) * 100
}

// Helper function to find biggest expense category
const findBiggestExpenseCategory = (transactions: any[]) => {
  const categoryTotals: { [key: string]: number } = {}
  
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0
      }
      categoryTotals[transaction.category] += transaction.amount
    }
  })
  
  let biggestCategory = ''
  let maxAmount = 0
  
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount
      biggestCategory = category
    }
  })
  
  return { category: biggestCategory, amount: maxAmount }
}

// Helper function to detect recurring expenses
const detectRecurringExpenses = (transactions: any[]) => {
  const recurring: { [key: string]: { amount: number, frequency: string, count: number } } = {}
  
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      const key = `${transaction.reason || transaction.category}`
      if (!recurring[key]) {
        recurring[key] = { amount: 0, frequency: '', count: 0 }
      }
      recurring[key].amount += transaction.amount
      recurring[key].count += 1
    }
  })
  
  // Filter for likely recurring expenses (appearing more than once)
  const likelyRecurring = Object.entries(recurring)
    .filter(([_, data]) => data.count > 1)
    .map(([name, data]) => ({
      name,
      amount: data.amount / data.count, // Average amount
      frequency: data.count > 4 ? 'Weekly' : data.count > 1 ? 'Monthly' : 'Occasional',
      total: data.amount
    }))
  
  return likelyRecurring
}

// Helper function to calculate running balance
const calculateRunningBalance = (initialBalance: number, transactions: any[]) => {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  const balanceData: { date: string; balance: number }[] = []
  let currentBalance = initialBalance
  
  sortedTransactions.forEach(transaction => {
    if (transaction.type === 'income') {
      currentBalance += transaction.amount
    } else {
      currentBalance -= transaction.amount
    }
    
    balanceData.push({
      date: transaction.date,
      balance: currentBalance
    })
  })
  
  return balanceData
}

// Helper function to get top spending/earning days
const getTopDays = (transactions: any[], type: 'income' | 'expense', limit: number = 5) => {
  const dayTotals: { [key: string]: number } = {}
  
  transactions.forEach(transaction => {
    if (transaction.type === type) {
      const date = new Date(transaction.date).toDateString()
      if (!dayTotals[date]) {
        dayTotals[date] = 0
      }
      dayTotals[date] += transaction.amount
    }
  })
  
  return Object.entries(dayTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([date, amount]) => ({ date, amount }))
}

export default async function AnalyticsPage(props: { searchParams: Promise<{ account?: string }> }) {
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
    .select('id, name, initial_balance')
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
  
  // Get selected account details
  const selectedAccount = accounts?.find(account => account.id === selectedAccountId) || accounts?.[0]
  
  // Get transactions for the selected account
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', selectedAccountId)
    .order('date', { ascending: false })
  
  // Get account's initial balance
  const initialBalance = selectedAccount?.initial_balance || 0
  
  // Calculate summary metrics
  let totalIncome = 0
  let totalExpense = 0
  
  transactions?.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount
    } else {
      totalExpense += transaction.amount
    }
  })
  
  const netBalance = initialBalance + totalIncome - totalExpense
  const savingsRate = calculateSavingsRate(totalIncome, totalExpense)
  const biggestExpense = findBiggestExpenseCategory(transactions || [])
  
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
      expense: dayExpense,
      net: dayIncome - dayExpense
    })
  }
  
  // Generate category breakdown data
  const categoryData: { name: string; value: number; color: string }[] = []
  const categoryColors = [
    '#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b'
  ]
  
  const categoryTotals: { [key: string]: number } = {}
  
  transactions?.forEach(transaction => {
    if (transaction.type === 'expense') {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0
      }
      categoryTotals[transaction.category] += transaction.amount
    }
  })
  
  let colorIndex = 0
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    categoryData.push({
      name: category,
      value: amount,
      color: categoryColors[colorIndex % categoryColors.length]
    })
    colorIndex++
  })
  
  // Detect recurring expenses
  const recurringExpenses = detectRecurringExpenses(transactions || [])
  
  // Calculate running balance
  const runningBalanceData = calculateRunningBalance(initialBalance, transactions || [])
  
  // Get top spending/earning days
  const topSpendingDays = getTopDays(transactions || [], 'expense')
  const topEarningDays = getTopDays(transactions || [], 'income')
  
  // Generate monthly trend data
  const monthlyTrendData = []
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
    
    monthlyTrendData.push({
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
            <h1 className="text-3xl font-bold">Analytics</h1>
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
          
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <AnalyticsCard
              title="Total Income"
              value={`$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={TrendingUpIcon}
            />
            <AnalyticsCard
              title="Total Expense"
              value={`$${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={TrendingDownIcon}
            />
            <AnalyticsCard
              title="Net Balance"
              value={`$${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSignIcon}
            />
            <AnalyticsCard
              title="Savings Rate"
              value={`${savingsRate.toFixed(1)}%`}
              icon={PieChartIcon}
            />
            <AnalyticsCard
              title="Biggest Expense"
              value={biggestExpense.category || "N/A"}
              change={`$${biggestExpense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              changeType="negative"
              icon={AlertCircleIcon}
            />
          </div>
          
          {/* Money Flow Chart */}
          <div className="rounded-lg border bg-card p-0">
            <h2 className="text-xl font-semibold p-6 pb-0">Money Flow</h2>
            <MoneyFlowChart data={dailyData} />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Category Breakdown */}
            <div className="rounded-lg border bg-card p-0">
              <h2 className="text-xl font-semibold p-6 pb-0">Category Breakdown</h2>
              <CategoryBreakdownChart data={categoryData} />
            </div>
            
            {/* Monthly Trends */}
            <div className="rounded-lg border bg-card p-0">
              <h2 className="text-xl font-semibold p-6 pb-0">Monthly Trends</h2>
              <MonthlyTrendsChart data={monthlyTrendData} />
            </div>
          </div>
          
          {/* Running Balance Chart */}
          <div className="rounded-lg border bg-card p-0">
            <h2 className="text-xl font-semibold p-6 pb-0">Balance Over Time</h2>
            <BalanceOverTimeChart data={runningBalanceData} />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recurring Expenses */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Recurring Expenses</h2>
              {recurringExpenses.length > 0 ? (
                <div className="space-y-3">
                  {recurringExpenses.map((expense, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{expense.name}</p>
                        <p className="text-sm text-muted-foreground">{expense.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-sm text-muted-foreground">Total: ${expense.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recurring expenses detected</p>
              )}
            </div>
            
            {/* Smart Insights */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Smart Insights</h2>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <LightbulbIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium">Savings Analysis</p>
                    <p className="text-sm text-muted-foreground">
                      {savingsRate >= 20 
                        ? "Great job! You're saving more than 20% of your income." 
                        : savingsRate >= 10 
                          ? "You're saving a healthy amount. Try to increase it to 20%." 
                          : "Consider reducing expenses to improve your savings rate."}
                    </p>
                  </div>
                </div>
                
                {biggestExpense.category && (
                  <div className="flex items-start p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                    <AlertCircleIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium">Spending Alert</p>
                      <p className="text-sm text-muted-foreground">
                        Your biggest expense is {biggestExpense.category} at ${biggestExpense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. 
                        Consider if this aligns with your budget.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <TrendingUpIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium">Financial Health</p>
                    <p className="text-sm text-muted-foreground">
                      {netBalance >= 0 
                        ? "You're in a positive financial position. Keep up the good work!" 
                        : "You're spending more than you're earning. Review your expenses."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Spending/Earning Days */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Top Spending Days</h2>
              {topSpendingDays.length > 0 ? (
                <div className="space-y-2">
                  {topSpendingDays.map((day, index) => (
                    <div key={index} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                      <span>{new Date(day.date).toLocaleDateString()}</span>
                      <span className="font-medium text-red-500">${day.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No spending data available</p>
              )}
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Top Earning Days</h2>
              {topEarningDays.length > 0 ? (
                <div className="space-y-2">
                  {topEarningDays.map((day, index) => (
                    <div key={index} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                      <span>{new Date(day.date).toLocaleDateString()}</span>
                      <span className="font-medium text-green-500">${day.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No income data available</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}