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
  const [initialBalance, setInitialBalance] = useState("")
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error("You must be logged in to set up your account")
        setLoading(false)
        return
      }

      console.log("User ID:", user.id)
      console.log("Initial Balance:", initialBalance)

      // Update the user's initial balance using service role
      const response = await fetch("/api/auth/update-initial-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          initialBalance: parseFloat(initialBalance) || 0,
        }),
      })

      console.log("Response status:", response.status)

      const result = await response.json()
      
      console.log("Response data:", result)
      
      if (!response.ok || !result.success) {
        toast.error(result.error || "Failed to update initial balance")
        setLoading(false)
        return
      }

      // Redirect to dashboard on successful setup
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again.")
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
            Let's get started by setting up your initial balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="balance" className="text-base">
                How much money do you have now?
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
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="pl-8 text-2xl h-14"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
              disabled={loading}
            >
              {loading ? "Setting up..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}