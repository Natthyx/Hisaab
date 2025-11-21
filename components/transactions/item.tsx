"use client"

import { Transaction } from "@/lib/types"
import { ArrowUpIcon, ArrowDownIcon, Trash2Icon, Edit2Icon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { EditTransactionForm } from "./edit-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface TransactionItemProps {
  transaction: Transaction
  onUpdate?: (updatedTransaction: Transaction) => void
}

export function TransactionItem({
  transaction,
  onUpdate,
}: TransactionItemProps) {
  const [isDeleted, setIsDeleted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [localTransaction, setLocalTransaction] = useState(transaction)
  
  const isIncome = localTransaction.type === "income"
  const date = new Date(localTransaction.date)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/transactions/delete/${localTransaction.id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to delete transaction')
        return
      }
      
      toast.success('Transaction deleted successfully')
      setIsDeleted(true)
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  const handleUpdate = (updatedTransaction: Transaction) => {
    setLocalTransaction(updatedTransaction)
    if (onUpdate) {
      onUpdate(updatedTransaction)
    }
    toast.success('Transaction updated successfully')
  }

  if (isDeleted) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}
          >
            {isIncome ? (
              <ArrowUpIcon className="h-5 w-5" />
            ) : (
              <ArrowDownIcon className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="font-medium">{localTransaction.reason}</p>
            <p className="text-sm text-muted-foreground">
              {localTransaction.category} • {formattedDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p
            className={`text-lg font-semibold ${
              isIncome ? "text-green-600" : "text-red-600"
            }`}
          >
            {isIncome ? "+" : "-"}${localTransaction.amount.toLocaleString()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <EditTransactionForm 
            transaction={localTransaction} 
            onClose={() => setIsEditing(false)}
            onUpdate={handleUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete();
                setShowDeleteConfirm(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}