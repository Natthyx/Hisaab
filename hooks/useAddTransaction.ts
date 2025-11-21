import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { validateTransactionForm } from "@/utils/validation"

interface Account {
  id: string
  name: string
  initial_balance: number
}

export function useAddTransaction(accounts: Account[], defaultAccountId: string | null) {
  const router = useRouter()
  
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")
  const [accountId, setAccountId] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{amount?: string, reason?: string, category?: string, accountId?: string}>({})

  // Set default account when accounts load
  useEffect(() => {
    if (accounts.length > 0) {
      if (defaultAccountId) {
        setAccountId(defaultAccountId)
      } else {
        setAccountId(accounts[0].id)
      }
    }
  }, [accounts, defaultAccountId])

  // Validate form inputs
  const validateForm = () => {
    // Create FormData object for validation
    const formData = new FormData()
    formData.append('amount', amount)
    formData.append('reason', reason)
    formData.append('category', category)
    // Note: Date is optional, so we don't include it in validation
    
    const validation = validateTransactionForm(formData)
    const newErrors = { ...validation.errors } as {amount?: string, reason?: string, category?: string, accountId?: string}
    
    // Account validation (if user has multiple accounts)
    if (accounts.length > 1 && !accountId) {
      newErrors.accountId = "Please select an account"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors below")
      throw new Error("Form validation failed")
    }
    
    setLoading(true)
    
    try {
      // Create FormData object
      const formData = new FormData()
      formData.append('amount', amount)
      formData.append('reason', reason)
      formData.append('type', type)
      formData.append('category', category)
      
      // Use provided date or default to current date
      const transactionDate = date || new Date().toISOString().split('T')[0]
      formData.append('date', transactionDate)
      
      // Only append accountId if it's provided and user has multiple accounts
      if (accountId) {
        formData.append('accountId', accountId)
      }

      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to add transaction')
        setLoading(false)
        throw new Error(result.error || 'Failed to add transaction')
      }
      
      toast.success('Transaction added successfully')
      router.push("/transactions")
    } catch (error) {
      toast.error('An unexpected error occurred')
      setLoading(false)
      throw error
    }
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    // Clear error when user types
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }))
    }
  }

  const handleReasonChange = (value: string) => {
    setReason(value)
    // Clear error when user types
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: undefined }))
    }
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    // Clear error when user types
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }))
    }
  }

  const handleAccountChange = (value: string) => {
    setAccountId(value)
    // Clear error when user selects
    if (errors.accountId) {
      setErrors(prev => ({ ...prev, accountId: undefined }))
    }
  }

  return {
    // State
    amount,
    reason,
    type,
    category,
    date,
    accountId,
    loading,
    errors,
    accounts,
    
    // Functions
    setType,
    setDate,
    handleAmountChange,
    handleReasonChange,
    handleCategoryChange,
    handleAccountChange,
    handleSubmit,
    validateForm
  }
}