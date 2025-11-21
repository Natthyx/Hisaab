import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from 'next/navigation'

export interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  reason: string
  category: string
  date: string
}

// Helper function to filter transactions by date range
export const filterTransactionsByDate = (transactions: Transaction[], filter: string) => {
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
export const filterTransactionsByType = (transactions: Transaction[], type: string) => {
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
export const filterTransactionsBySearch = (transactions: Transaction[], searchTerm: string) => {
  if (!searchTerm) return transactions
  
  const term = searchTerm.toLowerCase()
  return transactions.filter(t => 
    t.reason.toLowerCase().includes(term) || 
    t.category.toLowerCase().includes(term)
  )
}

export const useTransactions = (initialTransactions: Transaction[]) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filteredTransactions, setFilteredTransactions] = useState(initialTransactions)
  const [transactions, setTransactions] = useState(initialTransactions)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Update filtered transactions when filters or transactions change
  useEffect(() => {
    let result = [...transactions]
    
    // Apply search filter
    result = filterTransactionsBySearch(result, searchTerm)
    
    // Apply date filter
    result = filterTransactionsByDate(result, dateFilter)
    
    // Apply type filter
    result = filterTransactionsByType(result, typeFilter)
    
    setFilteredTransactions(result)
  }, [searchTerm, dateFilter, typeFilter, transactions])

  // Update transactions when initialTransactions change
  useEffect(() => {
    setTransactions(initialTransactions)
  }, [initialTransactions])

  const handleTransactionUpdate = useCallback((updatedTransaction: Transaction) => {
    // Update the transaction in the transactions list
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    )
  }, [])

  const handleAccountChange = (accountId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('account', accountId)
    router.push(`/transactions?${params.toString()}`)
  }

  return {
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    typeFilter,
    setTypeFilter,
    filteredTransactions,
    handleTransactionUpdate,
    handleAccountChange
  }
}