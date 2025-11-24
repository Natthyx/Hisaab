"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"
import { validateSignupForm } from "@/lib/auth/validation"
import { signUpWithEmailAndPassword } from "@/lib/auth/client-service"
import { LandingHeader } from "@/components/landing/landing-header"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)
  const [errors, setErrors] = useState<{email?: string, password?: string, confirmPassword?: string}>({})

  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    const validation = validateSignupForm(email, password, confirmPassword)
    if (!validation.isValid) {
      setErrors(validation.errors)
      toast.error("Please fix the errors below")
      return
    }
    
    setLoading(true)
    
    try {
      await signUpWithEmailAndPassword(email, password)

      // Show success message
      toast.success("Account created successfully! Please check your email for confirmation.")
      
      // Show confirmation message instead of redirecting immediately
      setShowConfirmationMessage(true)
      setLoading(false)
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }


  if (showConfirmationMessage) {
    return (
      <div className="flex flex-col min-h-screen">
        <LandingHeader />
        <div className="flex flex-1 items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center text-foreground">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                We've sent a confirmation link to {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Please check your email and click the confirmation link to verify your account.
                After verification, you'll be able to log in and set up your initial balance.
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              Create an account to manage your expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
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
                  }}
                  className={`bg-background border-input text-foreground placeholder-muted-foreground ${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    // Clear error when user types
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                    }
                  }}
                  className={`bg-background border-input text-foreground placeholder-muted-foreground ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Sign in
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}