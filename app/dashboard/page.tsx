"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { BalanceCard } from "@/components/balance-card"
import { ExpenseChart } from "@/components/expense-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import { mockChartData, mockMonthlyData } from "@/lib/mock-data"

export default function DashboardPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")

  const balance = 15000
  const income = 8500
  const expense = 5200

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Link href="/add">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </Link>
          </div>

          <BalanceCard balance={balance} income={income} expense={expense} />

          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="mt-6">
              <ExpenseChart
                data={mockChartData}
                title="Daily Overview"
                type="bar"
                dataKeys={[
                  { key: "income", color: "#10b981", label: "Income" },
                  { key: "expense", color: "#ef4444", label: "Expense" },
                ]}
                xAxisKey="date"
              />
            </TabsContent>
            <TabsContent value="weekly" className="mt-6">
              <ExpenseChart
                data={mockChartData}
                title="Weekly Overview"
                type="line"
                dataKeys={[
                  { key: "income", color: "#10b981", label: "Income" },
                  { key: "expense", color: "#ef4444", label: "Expense" },
                ]}
                xAxisKey="date"
              />
            </TabsContent>
            <TabsContent value="monthly" className="mt-6">
              <ExpenseChart
                data={mockMonthlyData}
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
