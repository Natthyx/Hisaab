"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"

export default function SetupPage() {
  const router = useRouter()
  const [accountName, setAccountName] = useState("Main Account")
  const [initialBalance, setInitialBalance] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{accountName?: string, initialBalance?: string}>({})

  const supabase = createClient()

  // Validate form inputs
  const validateForm = () => {
    const newErrors: {accountName?: string, initialBalance?: string} = {}
    
    // Account name validation
    if (!accountName.trim()) {
      newErrors.accountName = "Account name is required"
    }
    
    // Initial balance validation
    const balance = parseFloat(initialBalance)
    if (initialBalance && (isNaN(balance) || balance < 0)) {
      newErrors.initialBalance = "Please enter a valid positive number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors below")
      return
    }
    
    setLoading(true)
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error("You must be logged in to set up your account")
        setLoading(false)
        return
      }

      // Create the initial account
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: accountName,
          initial_balance: parseFloat(initialBalance) || 0,
        })
        .select()
        .single()

      if (accountError) {
        toast.error(accountError.message)
        setLoading(false)
        return
      }

      // Set this as the default account
      const { error: updateError } = await supabase
        .from('users')
        .update({ default_account_id: accountData.id })
        .eq('id', user.id)

      if (updateError) {
        toast.error(updateError.message)
        setLoading(false)
        return
      }

      toast.success("Account setup completed successfully")
      router.push("/dashboard")
    } catch (error) {
      toast.error("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Welcome to Hisaab
          </CardTitle>
          <CardDescription className="text-center">
            Let's get started by setting up your first account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="account-name" className="text-base">
                Account Name
              </Label>
              <Input
                id="account-name"
                type="text"
                placeholder="e.g., Main Account, Checking Account"
                value={accountName}
                onChange={(e) => {
                  setAccountName(e.target.value)
                  // Clear error when user types
                  if (errors.accountName) {
                    setErrors(prev => ({ ...prev, accountName: undefined }))
                  }
                }}
                className={`text-base h-12 ${errors.accountName ? "border-red-500" : ""}`}
              />
              {errors.accountName && (
                <p className="text-sm text-red-500">{errors.accountName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="balance" className="text-base">
                Initial Balance
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
                  $
                </span>
                <Input
                  id="balance"
                  type="number"
                  placeholder="0"
                  value={initialBalance}
                  onChange={(e) => {
                    setInitialBalance(e.target.value)
                    // Clear error when user types
                    if (errors.initialBalance) {
                      setErrors(prev => ({ ...prev, initialBalance: undefined }))
                    }
                  }}
                  className={`pl-8 text-2xl h-12 ${errors.initialBalance ? "border-red-500" : ""}`}
                  min="0"
                  step="0.01"
                />
                {errors.initialBalance && (
                  <p className="text-sm text-red-500">{errors.initialBalance}</p>
                )}
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}