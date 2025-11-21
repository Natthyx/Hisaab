"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Navigation } from "@/components/navigation"
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { categories } from "@/lib/types"
import { toast } from "sonner"
import { CalendarIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Account {
  id: string
  name: string
  initial_balance: number
}

export default function AddTransactionPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")
  const [accountId, setAccountId] = useState("")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [errors, setErrors] = useState<{amount?: string, reason?: string, category?: string, accountId?: string}>({})

  const supabase = createClient()

  // Fetch user's accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('accounts')
          .select('id, name, initial_balance')
          .eq('user_id', user.id)
          .order('name')

        if (error) {
          toast.error('Failed to load accounts')
          return
        }

        setAccounts(data || [])
        
        // Set default account if available
        if (data && data.length > 0) {
          // Check if user has a default account
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('default_account_id')
            .eq('id', user.id)
            .single()

          if (!userError && userData?.default_account_id) {
            setAccountId(userData.default_account_id)
          } else {
            setAccountId(data[0].id)
          }
        }
      } catch (error) {
        toast.error('An unexpected error occurred')
      } finally {
        setAccountsLoading(false)
      }
    }

    fetchAccounts()
  }, [router, supabase])

  // Validate form inputs
  const validateForm = () => {
    const newErrors: {amount?: string, reason?: string, category?: string, accountId?: string} = {}
    
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
    
    // Account validation (if user has multiple accounts)
    if (accounts.length > 1 && !accountId) {
      newErrors.accountId = "Please select an account"
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
      formData.append('date', date || new Date().toISOString())
      
      // Only append accountId if it's provided and user has multiple accounts
      if (accountId) {
        formData.append('accountId', accountId)
      }

      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to add transaction')
        setLoading(false)
        return
      }
      
      toast.success('Transaction added successfully')
      router.push("/transactions")
    } catch (error) {
      toast.error('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (accountsLoading) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <Navigation />
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Add Transaction</h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-32">
                  <p>Loading accounts...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Add Transaction</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {accounts.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="account">Account</Label>
                    <Select 
                      value={accountId} 
                      onValueChange={(value) => {
                        setAccountId(value)
                        // Clear error when user selects
                        if (errors.accountId) {
                          setErrors(prev => ({ ...prev, accountId: undefined }))
                        }
                      }}
                    >
                      <SelectTrigger 
                        id="account" 
                        className={errors.accountId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
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
                  <Select 
                    value={category} 
                    onValueChange={(value) => {
                      setCategory(value)
                      // Clear error when user selects
                      if (errors.category) {
                        setErrors(prev => ({ ...prev, category: undefined }))
                      }
                    }}
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
                    disabled={loading || (accounts.length > 1 && !accountId)}
                  >
                    {loading ? "Adding..." : "Add Transaction"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}