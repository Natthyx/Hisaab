"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { TransactionItem } from "@/components/transaction-item"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchIcon } from 'lucide-react'
import { mockTransactions } from "@/lib/mock-data"

export default function TransactionsPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "monthly">("all")

  const handleEdit = (id: string) => {
    console.log("Edit transaction:", id)
  }

  const handleDelete = (id: string) => {
    console.log("Delete transaction:", id)
  }

  const filteredTransactions = mockTransactions.filter((t) =>
    t.reason.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <h1 className="text-3xl font-bold">Transactions</h1>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value={filter} className="mt-6 space-y-4">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No transactions found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
