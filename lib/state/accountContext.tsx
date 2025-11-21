"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { Account } from "@/types"
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"

interface AccountContextType {
  accounts: Account[]
  defaultAccountId: string | null
  isCreating: boolean
  isSettingDefault: string | null
  addAccount: (account: Account) => void
  removeAccount: (accountId: string) => void
  setDefaultAccount: (accountId: string) => void
  createAccount: (formData: FormData) => Promise<{ success: boolean; data?: Account; error?: string }>
  deleteAccount: (accountId: string) => Promise<{ success: boolean; error?: string }>
  updateDefaultAccount: (accountId: string) => Promise<{ success: boolean; error?: string }>
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({
  children,
  accounts: initialAccounts,
  defaultAccountId: initialDefaultAccountId
}: {
  children: ReactNode
  accounts: Account[]
  defaultAccountId: string | null
}) {
  const supabase = createClient()
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(initialDefaultAccountId)
  const [isCreating, setIsCreating] = useState(false)
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null)

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

  const addAccount = (account: Account) => {
    setAccounts(prev => [...prev, account])
  }

  const removeAccount = (accountId: string) => {
    setAccounts(prev => prev.filter(account => account.id !== accountId))
    if (defaultAccountId === accountId) {
      setDefaultAccountId(null)
    }
  }

  const setDefaultAccount = (accountId: string) => {
    setDefaultAccountId(accountId)
  }

  const createAccount = async (formData: FormData) => {
    if (isCreating) return { success: false, error: "Already creating an account" }
    
    setIsCreating(true)
    try {
      const response = await fetch('/api/accounts/create', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to create account')
        return { success: false, error: result.error }
      }
      
      toast.success('Account created successfully')
      // Update the accounts list immediately
      setAccounts(prev => [...prev, result.data])
      // If this is the first account, set it as default
      if (accounts.length === 0) {
        setDefaultAccountId(result.data.id)
      }
      
      return { success: true, data: result.data }
    } catch (error) {
      toast.error('An unexpected error occurred')
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setIsCreating(false)
    }
  }

  const deleteAccount = async (accountId: string) => {
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
        return { success: false, error: result.error }
      }
      
      toast.success('Account deleted successfully')
      // Update the accounts list immediately
      setAccounts(prev => prev.filter(account => account.id !== accountId))
      // If this was the default account, clear the default
      if (defaultAccountId === accountId) {
        setDefaultAccountId(null)
      }
      
      return { success: true }
    } catch (error) {
      toast.error('An unexpected error occurred')
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const updateDefaultAccount = async (accountId: string) => {
    if (isSettingDefault === accountId) return { success: false, error: "Already setting this account as default" }
    
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
        return { success: false, error: result.error }
      }
      
      toast.success('Default account updated successfully')
      setDefaultAccountId(accountId)
      
      return { success: true }
    } catch (error) {
      toast.error('An unexpected error occurred')
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setIsSettingDefault(null)
    }
  }

  return (
    <AccountContext.Provider
      value={{
        accounts,
        defaultAccountId,
        isCreating,
        isSettingDefault,
        addAccount,
        removeAccount,
        setDefaultAccount,
        createAccount,
        deleteAccount,
        updateDefaultAccount
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccountContext() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error("useAccountContext must be used within an AccountProvider")
  }
  return context
}