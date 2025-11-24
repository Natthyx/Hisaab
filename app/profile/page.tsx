"use client"

import { Navigation } from "@/components/layout/navigation"
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchUserProfile, updateProfile, changePassword } from '@/lib/auth/client-service'
import { 
  UserIcon, 
  MailIcon, 
  CreditCardIcon, 
  LogOutIcon,
  ShieldIcon,
  BellIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"
import { getCachedUser, clearUserCache } from '@/lib/auth/client-service'

interface Account {
  id: string
  name: string
  initial_balance: number
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fullName, setFullName] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentPassword, setCurrentPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use cached user instead of calling getUser directly
        const userData = await getCachedUser()
        
        if (!userData) {
          router.push('/login')
          return
        }
        
        setUser(userData)

        // Get user's full name from the users table
        try {
          const userProfile = await fetchUserProfile(userData.id)
          if (userProfile) {
            setFullName(userProfile.full_name || "")
          } else if (userData.user_metadata?.full_name) {
            // Fallback to user metadata if available
            setFullName(userData.user_metadata.full_name)
          }
        } catch (error) {
          // If we can't fetch user profile, fallback to user metadata
          if (userData.user_metadata?.full_name) {
            setFullName(userData.user_metadata.full_name)
          }
        }

        // Get user's accounts
        try {
          const { data: accountsData, error: accountsError } = await supabase
            .from('accounts')
            .select('id, name, initial_balance, created_at')
            .eq('user_id', userData.id)
            .order('name')
          
          if (accountsError) {
            throw new Error(accountsError.message)
          }
          
          setAccounts(accountsData || [])
        } catch (error) {
          toast.error('Failed to load accounts')
        }
      } catch (error) {
        toast.error('An unexpected error occurred')
      }
    }
    
    fetchUserData()
  }, [router, supabase])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    
    try {
      await updateProfile(user.id, fullName)
      toast.success('Profile updated successfully')
      
      // Clear user cache after profile update
      clearUserCache()
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    setIsChangingPassword(true)
    
    try {
      await changePassword(user.email, currentPassword, newPassword)
      
      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
      // Clear user cache after password change
      clearUserCache()
      
      toast.success('Password updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSignOut = async () => {
    // Use fetch to call the signout API route instead of importing server-side function
    await fetch('/api/auth/signout', {
      method: 'POST',
    })
    
    // Clear user cache on signout
    clearUserCache()
    
    // Redirect to login page
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 p-4 pb-20 md:ml-64 md:p-8 md:pb-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input 
                      id="full_name" 
                      placeholder="Your full name" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your.email@example.com" 
                        value={user?.email || ''} 
                        className="pl-10" 
                        readOnly
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Information"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldIcon className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5" />
                Your Accounts
              </CardTitle>
              <CardDescription>
                Manage your financial accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.length > 0 ? (
                  accounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(account.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${account.initial_balance.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Initial Balance</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-muted-foreground">No accounts found</p>
                )}
                <div className="pt-4">
                  <Button variant="outline" onClick={() => router.push('/accounts')}>
                    Manage Accounts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Danger Zone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOutIcon className="h-5 w-5" />
                Sign Out
              </CardTitle>
              <CardDescription>
                Sign out from your account on this device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}