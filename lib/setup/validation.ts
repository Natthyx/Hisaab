export function validateSetupForm(accountName: string, initialBalance: string) {
  const errors: {accountName?: string, initialBalance?: string} = {}
  
  // Account name validation
  if (!accountName.trim()) {
    errors.accountName = "Account name is required"
  }
  
  // Initial balance validation
  const balance = parseFloat(initialBalance)
  if (initialBalance && (isNaN(balance) || balance < 0)) {
    errors.initialBalance = "Please enter a valid positive number"
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}