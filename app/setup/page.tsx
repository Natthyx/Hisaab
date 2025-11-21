"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"
import { validateSetupForm } from "@/lib/setup/validation"
// Removed the import of setupUserAccount since it's a server-side function

export default function SetupPage() {
  const router = useRouter()
  const [accountName, setAccountName] = useState("Main Account")
  const [initialBalance, setInitialBalance] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{accountName?: string, initialBalance?: string}>({})

  const supabase = createClient()

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    const validation = validateSetupForm(accountName, initialBalance)
    if (!validation.isValid) {
      setErrors(validation.errors)
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

      // Setup the user account using the API route
      const response = await fetch('/api/setup/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: accountName,
          initial_balance: initialBalance
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.error || "Failed to set up account")
        setLoading(false)
        return
      }

      toast.success("Account setup completed successfully")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred")
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