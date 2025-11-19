"use client"

import { Navigation } from "@/components/navigation"
import { AnalyticsCard } from "@/components/analytics-card"
import { ExpenseChart } from "@/components/expense-chart"
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from 'lucide-react'
import { mockChartData } from "@/lib/mock-data"

export default function DailyAnalyticsPage() {
  const totalIncome = 7400
  const totalExpense = 5800
  const netBalance = totalIncome - totalExpense

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <h1 className="text-3xl font-bold">Daily Analytics</h1>

          <div className="grid gap-4 md:grid-cols-3">
            <AnalyticsCard
              title="Total Income"
              value={`$${totalIncome.toLocaleString()}`}
              change="+12% from yesterday"
              changeType="positive"
              icon={TrendingUpIcon}
            />
            <AnalyticsCard
              title="Total Expense"
              value={`$${totalExpense.toLocaleString()}`}
              change="+8% from yesterday"
              changeType="negative"
              icon={TrendingDownIcon}
            />
            <AnalyticsCard
              title="Net Balance"
              value={`$${netBalance.toLocaleString()}`}
              change="+$200 from yesterday"
              changeType="positive"
              icon={DollarSignIcon}
            />
          </div>

          <ExpenseChart
            data={mockChartData}
            title="Daily Trend (Last 7 Days)"
            type="line"
            dataKeys={[
              { key: "income", color: "#10b981", label: "Income" },
              { key: "expense", color: "#ef4444", label: "Expense" },
            ]}
            xAxisKey="date"
          />

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Insights</h3>
            <p className="text-muted-foreground">
              Your expenses increased by 8% compared to yesterday. Consider reviewing your spending in the Transportation category.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
