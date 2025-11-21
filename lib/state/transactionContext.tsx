"use client"

import { createContext, useContext, ReactNode, useState } from "react"
import { Transaction } from "@/types"
import { toast } from "sonner"

interface TransactionContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (updatedTransaction: Transaction) => void
  removeTransaction: (transactionId: string) => void
  createTransaction: (formData: FormData) => Promise<{ success: boolean; data?: Transaction; error?: string }>
  editTransaction: (id: string, formData: FormData) => Promise<{ success: boolean; data?: Transaction; error?: string }>
  deleteTransaction: (id: string) => Promise<{ success: boolean; error?: string }>
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({
  children,
  transactions: initialTransactions
}: {
  children: ReactNode
  transactions: Transaction[]
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev])
  }

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    )
  }

  const removeTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId))
  }

  const createTransaction = async (formData: FormData) => {
    try {
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to create transaction')
        return { success: false, error: result.error }
      }
      
      toast.success('Transaction created successfully')
      addTransaction(result.data)
      
      return { success: true, data: result.data }
    } catch (error) {
      toast.error('An unexpected error occurred')
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const editTransaction = async (id: string, formData: FormData) => {
    try {
      const response = await fetch(`/api/transactions/update/${id}`, {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to update transaction')
        return { success: false, error: result.error }
      }
      
      toast.success('Transaction updated successfully')
      updateTransaction(result.data)
      
      return { success: true, data: result.data }
    } catch (error) {
      toast.error('An unexpected error occurred')
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/delete/${id}`, {
        method: 'POST',
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to delete transaction')
        return { success: false, error: result.error }
      }
      
      toast.success('Transaction deleted successfully')
      removeTransaction(id)
      
      return { success: true }
    } catch (error) {
      toast.error('An unexpected error occurred')
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        removeTransaction,
        createTransaction,
        editTransaction,
        deleteTransaction
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactionContext() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactionContext must be used within a TransactionProvider")
  }
  return context
}