import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Navigation } from "@/components/layout/navigation"
import { BalanceCard } from "@/components/accounts/balance-card"
import { ExpenseChart } from "@/components/analytics/expense-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import Link from "next/link"
import { redirect } from 'next/navigation'
import { getDashboardData } from "@/lib/dashboard/service"
import { getCachedUser } from '@/lib/auth/service'
import { DateFilter } from "@/components/dashboard/date-filter"

export default async function DashboardPage(props: { searchParams: Promise<{ account?: string, dateRange?: 'current' | 'previous' }> }) {
  const searchParams = await props.searchParams
  
  // Get user data
  const user = await getCachedUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get dashboard data using the service function
  const {
    accounts,
    selectedAccount,
    selectedAccountId,
    transactions,
    totalIncome,
    totalExpense,
    balance,
    dailyData,
    weeklyData,
    monthlyData,
    dateRange
  } = await getDashboardData(user.id, searchParams.account, searchParams.dateRange)
  
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 p-4 pb-20 md:ml-64 md:p-8 md:pb-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header with buttons on the same line even on mobile */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
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

          <BalanceCard balance={balance} income={totalIncome} expense={totalExpense} />

          <Tabs defaultValue="daily">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="grid w-full grid-cols-3 sm:w-[300px]">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              <DateFilter currentDateRange={dateRange || 'current'} />
            </div>
            <TabsContent value="daily" className="mt-6 p-0">
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
            <TabsContent value="weekly" className="mt-6 p-0">
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
            <TabsContent value="monthly" className="mt-6 p-0">
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
        {/* Recent Transactions */}
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <Link href="/transactions" className="text-sm text-indigo-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {transactions && transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{transaction.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <p className="py-4 text-center text-muted-foreground">No transactions yet</p>
              )}
            </div>
          </div>
      </main>
    </div>
  )
}