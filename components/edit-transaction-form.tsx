"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { categories } from "@/lib/types"
import { toast } from "sonner"
import { CalendarIcon } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  reason: string
  type: "income" | "expense"
  category: string
  date: string
}

interface EditTransactionFormProps {
  transaction: Transaction
  onClose: () => void
  onUpdate: (updatedTransaction: Transaction) => void
}

export function EditTransactionForm({ transaction, onClose, onUpdate }: EditTransactionFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [reason, setReason] = useState(transaction.reason)
  const [type, setType] = useState<"income" | "expense">(transaction.type)
  const [category, setCategory] = useState(transaction.category)
  const [date, setDate] = useState(new Date(transaction.date).toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{amount?: string, reason?: string, category?: string, date?: string}>({})

  // Validate form inputs
  const validateForm = () => {
    const newErrors: {amount?: string, reason?: string, category?: string, date?: string} = {}
    
    // Amount validation
    const amountValue = parseFloat(amount)
    if (!amount) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Please enter a valid positive amount"
    }
    
    // Reason validation
    if (!reason.trim()) {
      newErrors.reason = "Reason is required"
    }
    
    // Category validation
    if (!category) {
      newErrors.category = "Category is required"
    }
    
    // Date validation
    if (!date) {
      newErrors.date = "Date is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors below")
      return
    }
    
    setLoading(true)
    
    try {
      // Create FormData object
      const formData = new FormData()
      formData.append('amount', amount)
      formData.append('reason', reason)
      formData.append('type', type)
      formData.append('category', category)
      formData.append('date', date ? new Date(date).toISOString() : new Date().toISOString())

      const response = await fetch(`/api/transactions/update/${transaction.id}`, {
        method: 'PUT',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to update transaction')
        setLoading(false)
        return
      }
      
      toast.success('Transaction updated successfully')
      onUpdate(result.data)
      onClose()
    } catch (error) {
      toast.error('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  // Clear error when user types
                  if (errors.amount) {
                    setErrors(prev => ({ ...prev, amount: undefined }))
                  }
                }}
                className={`pl-8 ${errors.amount ? "border-red-500" : ""}`}
                min="0"
                step="0.01"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => {
              setCategory(value)
              // Clear error when user selects
              if (errors.category) {
                setErrors(prev => ({ ...prev, category: undefined }))
              }
            }}>
              <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="What was this transaction for?"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                // Clear error when user types
                if (errors.reason) {
                  setErrors(prev => ({ ...prev, reason: undefined }))
                }
              }}
              className={errors.reason ? "border-red-500" : ""}
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  // Clear error when user selects
                  if (errors.date) {
                    setErrors(prev => ({ ...prev, date: undefined }))
                  }
                }}
                className={`pl-10 ${errors.date ? "border-red-500" : ""}`}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Transaction"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}