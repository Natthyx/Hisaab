"use client"

import { Navigation } from "@/components/navigation"
import { AnalyticsCard } from "@/components/analytics-card"
import { ExpenseChart } from "@/components/expense-chart"
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from 'lucide-react'
import { mockMonthlyData } from "@/lib/mock-data"

export default function MonthlyAnalyticsPage() {
  const totalIncome = 22000
  const totalExpense = 17000
  const netBalance = totalIncome - totalExpense

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <h1 className="text-3xl font-bold">Monthly Analytics</h1>

          <div className="grid gap-4 md:grid-cols-3">
            <AnalyticsCard
              title="Total Income"
              value={`$${totalIncome.toLocaleString()}`}
              change="+15% from last month"
              changeType="positive"
              icon={TrendingUpIcon}
            />
            <AnalyticsCard
              title="Total Expense"
              value={`$${totalExpense.toLocaleString()}`}
              change="+6% from last month"
              changeType="negative"
              icon={TrendingDownIcon}
            />
            <AnalyticsCard
              title="Net Balance"
              value={`$${netBalance.toLocaleString()}`}
              change="+$1,200 from last month"
              changeType="positive"
              icon={DollarSignIcon}
            />
          </div>

          <ExpenseChart
            data={mockMonthlyData}
            title="Monthly Trend (Last 6 Months)"
            type="bar"
            dataKeys={[
              { key: "income", color: "#10b981", label: "Income" },
              { key: "expense", color: "#ef4444", label: "Expense" },
            ]}
            xAxisKey="month"
          />

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Insights</h3>
            <p className="text-muted-foreground">
              Great job! Your income increased by 15% this month while expenses only grew by 6%. You're saving more effectively.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
