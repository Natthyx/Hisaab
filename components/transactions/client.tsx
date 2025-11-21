"use client"

import { TransactionItem } from "@/components/transactions/item"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { useTransactions, filterTransactionsByDate } from "@/hooks/useTransactions"
import { Transaction } from "@/types"

interface Account {
  id: string
  name: string
}

interface TransactionsClientProps {
  initialTransactions: Transaction[]
  accounts: Account[]
  selectedAccountId?: string
}

export function TransactionsClient({ initialTransactions, accounts, selectedAccountId }: TransactionsClientProps) {
  const {
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    typeFilter,
    setTypeFilter,
    filteredTransactions,
    handleTransactionUpdate,
    handleAccountChange
  } = useTransactions(initialTransactions)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {accounts.length > 1 && (
          <div className="w-full sm:w-64">
            <Select value={selectedAccountId || ""} onValueChange={handleAccountChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1 sm:gap-2">
          <Button 
            variant={typeFilter === "all" ? "default" : "outline"} 
            className="gap-1 sm:gap-2 px-2 sm:px-4"
            onClick={() => setTypeFilter("all")}
            size="sm"
          >
            <FilterIcon className="h-4 w-4" />
            <span className="hidden sm:inline">All</span>
          </Button>
          <Button 
            variant={typeFilter === "income" ? "default" : "outline"} 
            className="gap-1 sm:gap-2 px-2 sm:px-4"
            onClick={() => setTypeFilter("income")}
            size="sm"
          >
            <ArrowUpIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Income</span>
          </Button>
          <Button 
            variant={typeFilter === "expense" ? "default" : "outline"} 
            className="gap-1 sm:gap-2 px-2 sm:px-4"
            onClick={() => setTypeFilter("expense")}
            size="sm"
          >
            <ArrowDownIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Expense</span>
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