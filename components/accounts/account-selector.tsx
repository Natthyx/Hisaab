"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Account {
  id: string
  name: string
}

interface AccountSelectorProps {
  accounts: Account[]
  selectedAccountId: string
}

export function AccountSelector({ accounts, selectedAccountId }: AccountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  
  const selectedAccount = accounts.find(account => account.id === selectedAccountId) || accounts[0]
  
  const handleAccountSelect = async (accountId: string) => {
    try {
      // Set this account as default using the API
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
      
      // Refresh the page to reflect the change
      router.refresh()
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          aria-label="Select account"
        >
          <span className="truncate">{selectedAccount?.name}</span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onSelect={() => handleAccountSelect(account.id)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{account.name}</span>
            {account.id === selectedAccountId && (
              <CheckIcon className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}