"use client"

import { useEffect, useState } from "react"
import { AnalyticsCard } from "@/components/analytics/card"
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  DollarSignIcon, 
  PieChartIcon,
  AlertCircleIcon,
  LightbulbIcon
} from 'lucide-react'
import { 
  MoneyFlowChart,
  CategoryBreakdownChart,
  MonthlyTrendsChart,
  BalanceOverTimeChart
} from "@/components/analytics/charts"
import { useAnalytics } from "@/hooks/useAnalytics"

interface Account {
  id: string
  name: string
  initial_balance: number
}

export function AnalyticsClient({ 
  transactions, 
  initialBalance,
  accounts,
  selectedAccount
}: { 
  transactions: any[], 
  initialBalance: number,
  accounts: Account[],
  selectedAccount: Account | undefined
}) {
  const {
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    biggestExpense,
    dailyData,
    categoryData,
    recurringExpenses,
    runningBalanceData,
    topSpendingDays,
    topEarningDays,
    monthlyTrendData
  } = useAnalytics(transactions, initialBalance)

  return (
    <>
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
              {recurringExpenses.map((expense: any, index: number) => (
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
              {topSpendingDays.map((day: any, index: number) => (
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
              {topEarningDays.map((day: any, index: number) => (
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
    </>
  )
}