"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { PlusIcon, TrashIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Account {
  id: string
  name: string
  initial_balance: number
  created_at: string
}

export function AccountsClient({ accounts: initialAccounts, defaultAccountId: initialDefaultAccountId }: { accounts: Account[], defaultAccountId: string | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(initialDefaultAccountId)
  const [isCreating, setIsCreating] = useState(false)
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; accountId: string | null }>({ open: false, accountId: null })
  const [errors, setErrors] = useState<{name?: string, initial_balance?: string}>({})
  const formRef = useRef<HTMLFormElement>(null)

  // Listen for account changes
  useEffect(() => {
    const channel = supabase
      .channel('accounts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'accounts',
        },
        (payload) => {
          // Add new account to the list
          const newAccount = payload.new as Account
          setAccounts(prev => [...prev, newAccount])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'accounts',
        },
        (payload) => {
          // Remove deleted account from the list
          const deletedAccountId = payload.old.id
          setAccounts(prev => prev.filter(account => account.id !== deletedAccountId))
          // If this was the default account, clear the default
          if (defaultAccountId === deletedAccountId) {
            setDefaultAccountId(null)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          // Update default account if changed
          if (payload.new.default_account_id !== defaultAccountId) {
            setDefaultAccountId(payload.new.default_account_id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, defaultAccountId])

  // Validate form inputs
  const validateForm = (formData: FormData) => {
    const newErrors: {name?: string, initial_balance?: string} = {}
    
    // Name validation
    const name = formData.get('name') as string
    if (!name?.trim()) {
      newErrors.name = "Account name is required"
    }
    
    // Initial balance validation
    const initialBalance = formData.get('initial_balance') as string
    if (initialBalance) {
      const balance = parseFloat(initialBalance)
      if (isNaN(balance) || balance < 0) {
        newErrors.initial_balance = "Please enter a valid positive number"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateAccount = async (formData: FormData) => {
    if (isCreating) return // Prevent multiple clicks
    
    // Validate form before submission
    if (!validateForm(formData)) {
      toast.error("Please fix the errors below")
      return
    }
    
    setIsCreating(true)
    try {
      const response = await fetch('/api/accounts/create', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to create account')
        setIsCreating(false)
        return
      }
      
      toast.success('Account created successfully')
      // Update the accounts list immediately
      setAccounts(prev => [...prev, result.data])
      // If this is the first account, set it as default
      if (accounts.length === 0) {
        setDefaultAccountId(result.data.id)
      }
      
      // Reset form
      if (formRef.current) {
        formRef.current.reset()
        setErrors({})
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteAccount = async () => {
    const accountId = deleteConfirmation.accountId
    if (!accountId) return
    
    try {
      const formData = new FormData()
      formData.append('accountId', accountId)
      
      const response = await fetch('/api/accounts/delete', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to delete account')
        return
      }
      
      toast.success('Account deleted successfully')
      // Update the accounts list immediately
      setAccounts(prev => prev.filter(account => account.id !== accountId))
      // If this was the default account, clear the default
      if (defaultAccountId === accountId) {
        setDefaultAccountId(null)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setDeleteConfirmation({ open: false, accountId: null })
    }
  }

  const handleSetDefaultAccount = async (accountId: string) => {
    if (isSettingDefault === accountId) return // Prevent multiple clicks
    
    setIsSettingDefault(accountId)
    try {
      const formData = new FormData()
      formData.append('accountId', accountId)
      
      const response = await fetch('/api/accounts/set-default', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to set default account')
        return
      }
      
      toast.success('Default account updated successfully')
      setDefaultAccountId(accountId)
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSettingDefault(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Accounts</CardTitle>
          <CardDescription>Create and manage your financial accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{account.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Initial Balance: ${account.initial_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {account.id === defaultAccountId && (
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handleSetDefaultAccount(account.id)}
                    variant={account.id === defaultAccountId ? "default" : "outline"}
                    size="sm"
                    disabled={account.id === defaultAccountId || isSettingDefault === account.id}
                  >
                    {isSettingDefault === account.id ? "Setting..." : account.id === defaultAccountId ? "Default" : "Set Default"}
                  </Button>
                  <Button 
                    onClick={() => setDeleteConfirmation({ open: true, accountId: account.id })}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    disabled={isSettingDefault !== null}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {accounts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>You don't have any accounts yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Account</CardTitle>
          <CardDescription>Add a new financial account</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Checking Account, Savings Account"
                className={errors.name ? "border-red-500" : ""}
                onChange={() => {
                  // Clear error when user types
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: undefined }))
                  }
                }}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initial_balance">Initial Balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                  $
                </span>
                <Input
                  id="initial_balance"
                  name="initial_balance"
                  type="number"
                  placeholder="0.00"
                  className={`pl-8 ${errors.initial_balance ? "border-red-500" : ""}`}
                  step="0.01"
                  min="0"
                  onChange={() => {
                    // Clear error when user types
                    if (errors.initial_balance) {
                      setErrors(prev => ({ ...prev, initial_balance: undefined }))
                    }
                  }}
                />
                {errors.initial_balance && (
                  <p className="text-sm text-red-500">{errors.initial_balance}</p>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmation.open} onOpenChange={(open) => setDeleteConfirmation({ open, accountId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this account? This action cannot be undone and all associated transactions will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmation({ open: false, accountId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}