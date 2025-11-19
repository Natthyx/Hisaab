"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SetupPage() {
  const router = useRouter()
  const [initialBalance, setInitialBalance] = useState("")

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock setup - redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Welcome to ExpenseTracker
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
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
