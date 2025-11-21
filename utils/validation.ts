// Validation utilities

export const validateAccountForm = (formData: FormData) => {
  const errors: {name?: string, initial_balance?: string} = {}
  
  // Name validation
  const name = formData.get('name') as string
  if (!name?.trim()) {
    errors.name = "Account name is required"
  }
  
  // Initial balance validation
  const initialBalance = formData.get('initial_balance') as string
  if (initialBalance) {
    const balance = parseFloat(initialBalance)
    if (isNaN(balance) || balance < 0) {
      errors.initial_balance = "Please enter a valid positive number"
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateTransactionForm = (formData: FormData) => {
  const errors: {amount?: string, reason?: string, category?: string} = {}
  
  // Amount validation
  const amount = formData.get('amount') as string
  if (!amount) {
    errors.amount = "Amount is required"
  } else {
    const amountValue = parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      errors.amount = "Please enter a valid positive number"
    }
  }
  
  // Reason validation
  const reason = formData.get('reason') as string
  if (!reason?.trim()) {
    errors.reason = "Reason is required"
  }
  
  // Category validation
  const category = formData.get('category') as string
  if (!category?.trim()) {
    errors.category = "Category is required"
  }
  
  // Note: Date is optional, so no validation needed
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}