"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"
import { validateLoginForm } from "@/lib/auth/validation"
import { signInWithEmailAndPassword } from "@/lib/auth/client-service"
import { checkUserHasAccounts } from "@/lib/accounts/client-service"
import Link from "next/link"
import { getCachedUser } from '@/lib/auth/client-service'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{email?: string, password?: string}>({})
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()

  // Check if user is already logged in and redirect appropriately
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Use cached user instead of calling getUser directly
        const user = await getCachedUser()
        if (user) {
          // Check if user has accounts
          const hasAccounts = await checkUserHasAccounts(user.id)
          
          // If user has accounts, redirect to dashboard
          if (hasAccounts) {
            router.push("/dashboard")
          } 
          // If user has no accounts, redirect to setup
          else {
            router.push("/setup")
          }
        }
      } catch (error) {
        console.error("Error checking user session:", error)
      }
    }
    
    checkUserSession()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setAuthError(null)
    
    // Validate form before submission
    const validation = validateLoginForm(email, password)
    if (!validation.isValid) {
      setErrors(validation.errors)
      toast.error("Please fix the errors below")
      return
    }
    
    setLoading(true)
    
    try {
      const data = await signInWithEmailAndPassword(email, password)

      // Show success message
      toast.success("Login successful! Redirecting...")
      
      // Check if user has accounts
      if (data.user) {
        const hasAccounts = await checkUserHasAccounts(data.user.id)
        
        // If user has accounts, redirect to dashboard
        if (hasAccounts) {
          router.push("/dashboard")
        } 
        // If user has no accounts, redirect to setup
        else {
          router.push("/setup")
        }
      }
    } catch (error: any) {
      setAuthError(error.message || "Invalid email or password")
      toast.error(error.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your Hisaab account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  // Clear error when user types
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: undefined }))
                  }
                  // Clear auth error when user types
                  if (authError) {
                    setAuthError(null)
                  }
                }}
                className={`text-base h-12 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  // Clear error when user types
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }))
                  }
                  // Clear auth error when user types
                  if (authError) {
                    setAuthError(null)
                  }
                }}
                className={`text-base h-12 ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            {authError && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}