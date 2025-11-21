"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from "sonner"
import { useEffect, useState } from "react"

interface Account {
  id: string
  name: string
}

interface AccountSelectorProps {
  accounts: Account[]
  selectedAccountId: string
}

export function AccountSelector({ accounts, selectedAccountId }: AccountSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localSelectedAccountId, setLocalSelectedAccountId] = useState(selectedAccountId)
  
  // Update local state when selectedAccountId prop changes
  useEffect(() => {
    setLocalSelectedAccountId(selectedAccountId)
  }, [selectedAccountId])
  
  const handleAccountChange = async (accountId: string) => {
    // Update local state immediately for UI feedback
    setLocalSelectedAccountId(accountId)
    
    // Update the URL with the new account
    const params = new URLSearchParams(searchParams.toString())
    params.set('account', accountId)
    router.push(`?${params.toString()}`)
    
    // Set this account as the user's default account
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
        // Revert local state if API call fails
        setLocalSelectedAccountId(selectedAccountId)
        return
      }
      
      toast.success('Default account updated successfully')
    } catch (error) {
      toast.error('An unexpected error occurred')
      // Revert local state if API call fails
      setLocalSelectedAccountId(selectedAccountId)
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Account:</span>
      <Select value={localSelectedAccountId} onValueChange={handleAccountChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}