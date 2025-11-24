"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"
import { validateLoginForm } from "@/lib/auth/validation"
import { signInWithEmailAndPassword } from "@/lib/auth/client-service"
import { checkUserHasAccounts } from "@/lib/accounts/client-service"
import { LandingHeader } from "@/components/landing/landing-header"

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
        const { data: { user } } = await supabase.auth.getUser()
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
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <div className="flex flex-1 items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-foreground">
              Hisaab
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to manage your expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Authentication Error Message */}
            {authError && (
              <div className="mb-4">
                <ErrorMessage 
                  title="Login Failed" 
                  message={authError} 
                />
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
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
                  className={`bg-background border-input text-foreground placeholder-muted-foreground ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
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
                  className={`bg-background border-input text-foreground placeholder-muted-foreground ${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}