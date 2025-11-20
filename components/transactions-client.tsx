"use client"

import { useState, useEffect } from "react"
import { TransactionItem } from "@/components/transaction-item"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  reason: string
  category: string
  date: string
}

interface TransactionsClientProps {
  initialTransactions: Transaction[]
}

// Helper function to filter transactions by date range
const filterTransactionsByDate = (transactions: Transaction[], filter: string) => {
  const now = new Date()
  
  if (filter === "daily") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      const transactionDay = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate())
      return transactionDay.getTime() === today.getTime()
    })
  }
  
  if (filter === "weekly") {
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startOfWeek && transactionDate <= endOfWeek
    })
  }
  
  if (filter === "monthly") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startOfMonth && transactionDate <= endOfMonth
    })
  }
  
  // "all" filter returns all transactions
  return transactions
}

// Helper function to filter transactions by type
const filterTransactionsByType = (transactions: Transaction[], type: string) => {
  if (type === "income") {
    return transactions.filter(t => t.type === "income")
  }
  
  if (type === "expense") {
    return transactions.filter(t => t.type === "expense")
  }
  
  // "all" type returns all transactions
  return transactions
}

// Helper function to filter transactions by search term
const filterTransactionsBySearch = (transactions: Transaction[], searchTerm: string) => {
  if (!searchTerm) return transactions
  
  const term = searchTerm.toLowerCase()
  return transactions.filter(t => 
    t.reason.toLowerCase().includes(term) || 
    t.category.toLowerCase().includes(term)
  )
}

export function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filteredTransactions, setFilteredTransactions] = useState(initialTransactions)

  // Update filtered transactions when filters change
  useEffect(() => {
    let result = [...initialTransactions]
    
    // Apply search filter
    result = filterTransactionsBySearch(result, searchTerm)
    
    // Apply date filter
    result = filterTransactionsByDate(result, dateFilter)
    
    // Apply type filter
    result = filterTransactionsByType(result, typeFilter)
    
    setFilteredTransactions(result)
  }, [searchTerm, dateFilter, typeFilter, initialTransactions])

  const handleTransactionUpdate = (updatedTransaction: Transaction) => {
    // Update the transaction in the filtered transactions list
    setFilteredTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={typeFilter === "all" ? "default" : "outline"} 
            className="gap-2"
            onClick={() => setTypeFilter("all")}
          >
            <FilterIcon className="h-4 w-4" />
            <span>All</span>
          </Button>
          <Button 
            variant={typeFilter === "income" ? "default" : "outline"} 
            className="gap-2"
            onClick={() => setTypeFilter("income")}
          >
            <ArrowUpIcon className="h-4 w-4" />
            <span>Income</span>
          </Button>
          <Button 
            variant={typeFilter === "expense" ? "default" : "outline"} 
            className="gap-2"
            onClick={() => setTypeFilter("expense")}
          >
            <ArrowDownIcon className="h-4 w-4" />
            <span>Expense</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={dateFilter} onValueChange={setDateFilter}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6 space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onUpdate={handleTransactionUpdate}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found
            </div>
          )}
        </TabsContent>
        <TabsContent value="daily" className="mt-6 space-y-4">
          {filteredTransactions.length > 0 ? (
            filterTransactionsByDate(filteredTransactions, "daily").map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onUpdate={handleTransactionUpdate}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found
            </div>
          )}
        </TabsContent>
        <TabsContent value="weekly" className="mt-6 space-y-4">
          {filteredTransactions.length > 0 ? (
            filterTransactionsByDate(filteredTransactions, "weekly").map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onUpdate={handleTransactionUpdate}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found
            </div>
          )}
        </TabsContent>
        <TabsContent value="monthly" className="mt-6 space-y-4">
          {filteredTransactions.length > 0 ? (
            filterTransactionsByDate(filteredTransactions, "monthly").map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onUpdate={handleTransactionUpdate}
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
  )
}