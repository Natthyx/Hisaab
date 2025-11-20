"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Check if user is already logged in and needs to complete setup
  useEffect(() => {
    checkUserSetup()
  }, [])

  const checkUserSetup = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return
      }

      // Check if user has completed setup
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('initial_balance')
        .eq('id', user.id)
        .single()

      // If user exists and has set initial balance, redirect to dashboard
      if (!userError && userData && userData.initial_balance !== null && userData.initial_balance !== 0) {
        router.push("/dashboard")
      } 
      // If user exists but hasn't set initial balance, redirect to setup
      else if (!userError && userData) {
        router.push("/setup")
      }
      // If user doesn't exist in our users table, redirect to setup
      else {
        router.push("/setup")
      }
    } catch (error) {
      console.error("Error checking user setup:", error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      // Check if user has completed setup
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('initial_balance')
          .eq('id', data.user.id)
          .single()

        // If user exists and has set initial balance, redirect to dashboard
        if (!userError && userData && userData.initial_balance !== null && userData.initial_balance !== 0) {
          router.push("/dashboard")
        } 
        // If user exists but hasn't set initial balance, redirect to setup
        else if (!userError && userData) {
          router.push("/setup")
        }
        // If user doesn't exist in our users table, redirect to setup
        else {
          router.push("/setup")
        }
      }

      router.refresh()
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Hisaab
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to manage your expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="text-indigo-600 hover:underline"
                disabled={loading}
              >
                Sign up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}