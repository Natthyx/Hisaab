"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ErrorMessage } from "@/components/ui/error-message"
import { categories } from "@/lib/types"
import { CalendarIcon } from 'lucide-react'
import { useAddTransaction } from "@/hooks/useAddTransaction"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from "react"

interface Account {
  id: string
  name: string
  initial_balance: number
}

export function AddTransactionClient({ accounts: initialAccounts, defaultAccountId: initialDefaultAccountId }: { accounts: Account[], defaultAccountId: string | null }) {
  const router = useRouter()
  
  const {
    // State
    amount,
    reason,
    type,
    category,
    date,
    accountId,
    loading,
    errors,
    accounts,
    
    // Functions
    setType,
    setDate,
    handleAmountChange,
    handleReasonChange,
    handleCategoryChange,
    handleAccountChange,
    handleSubmit,
  } = useAddTransaction(initialAccounts, initialDefaultAccountId)

  // Local state for form submission errors
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Clear submit error when any field changes
  useEffect(() => {
    setSubmitError(null)
  }, [amount, reason, type, category, date, accountId])

  // Override handleSubmit to handle submission errors
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    try {
      await handleSubmit(e)
    } catch (error: any) {
      setSubmitError(error.message || "Failed to add transaction. Please try again.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Submission Error Message */}
          {submitError && (
            <ErrorMessage 
              title="Transaction Error" 
              message={submitError} 
            />
          )}
          
          {initialAccounts.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select 
                value={accountId} 
                onValueChange={handleAccountChange}
              >
                <SelectTrigger 
                  id="account" 
                  className={errors.accountId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {initialAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-sm text-red-500">{errors.accountId}</p>
              )}
            </div>
          )}

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
                onChange={(e) => handleAmountChange(e.target.value)}
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
            <Select 
              value={category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger 
                id="category" 
                className={errors.category ? "border-red-500" : ""}
              >
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
              onChange={(e) => handleReasonChange(e.target.value)}
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
                onChange={(e) => setDate(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {date ? "Selected date will be used" : "No date selected - today's date will be used"}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              disabled={loading || (initialAccounts.length > 1 && !accountId)}
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Adding...
                </>
              ) : "Add Transaction"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}