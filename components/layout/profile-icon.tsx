"use client"

import { UserIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AccountSelector } from "@/components/accounts/account-selector"
import { useRouter } from 'next/navigation'
import { getCachedUser, clearUserCache } from '@/lib/auth/client-service'

interface Account {
  id: string
  name: string
}

export function ProfileIcon() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use cached user instead of calling getUser directly
        const user = await getCachedUser()
        
        if (!user) return

        setUserEmail(user.email || null)

        // Get user's accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name')
        
        if (accountsError) {
          console.error('Error fetching accounts:', accountsError)
          return
        }

        setAccounts(accountsData || [])

        // Get user's default account
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('default_account_id')
          .eq('id', user.id)
          .single()
        
        if (!userError && userData) {
          setDefaultAccountId(userData.default_account_id)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    
    fetchUserData()
  }, [supabase])

  // Listen for account changes
  useEffect(() => {
    const channel = supabase
      .channel('profile-accounts-changes')
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

  if (!userEmail) return null
    // Handle account change from AccountSelector
  const handleAccountChange = (accountId: string) => {
    setDefaultAccountId(accountId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-full rounded-lg border border-transparent hover:bg-muted px-3 py-2 md:border-gray-300 md:rounded-lg md:px-20">
          <div className="flex w-full items-center justify-center gap-2">
              <UserIcon className="h-5 w-5" />
              <span className="hidden md:inline">Profile</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-2 p-2">
          <div className="rounded-full bg-gray-200 p-2">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">{userEmail}</p>
            <p className="text-xs text-muted-foreground">View profile</p>
          </div>
        </div>
        <div className="border-t pt-2">
          {accounts.length > 0 && defaultAccountId && (
            <>
            <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-2">ACCOUNTS</p>
            <AccountSelector 
              accounts={accounts} 
              selectedAccountId={defaultAccountId}
              onAccountChange={handleAccountChange}
            /></div>
            </>
            
          )}
        </div>
        <DropdownMenuItem onClick={() => router.push('/profile')}>
            Profile Settings
          </DropdownMenuItem>
        <DropdownMenuItem className='text-red-600' onClick={handleSignOut}>
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}