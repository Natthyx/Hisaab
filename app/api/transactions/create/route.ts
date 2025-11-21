import { z } from 'zod'
import { 
  getUserFromRequest, 
  createSuccessResponse, 
  createErrorResponse,
  validateFormData
} from '@/lib/api/index'
import { createTransaction } from '@/lib/transactions/service'
import { getUserDefaultAccount, getUserAccounts } from '@/lib/accounts/service'

const transactionSchema = z.object({
  amount: z.string(), // Changed to string since FormData sends strings
  reason: z.string().optional(),
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
  date: z.string().optional(), // ISO string or date string from input
  accountId: z.string().optional(), // Optional account ID
})

export async function POST(request: Request) {
  try {
    // Get the current user
    const { user, error: userError } = await getUserFromRequest(request)
    
    if (userError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }
    
    // Get form data
    const formData = await request.formData()
    
    // Validate the request body
    const validation = validateFormData(formData, transactionSchema)
    if (!validation.isValid) {
      return createErrorResponse('Invalid request body', 400)
    }
    
    const { amount, reason, type, category, date, accountId } = validation.data
    
    // Get the account ID - either provided or use user's default account
    let transactionAccountId = accountId;
    
    if (!transactionAccountId) {
      // Get user's default account using the service function
      const userData = await getUserDefaultAccount(user.id)
      transactionAccountId = userData?.default_account_id;
      
      // If no default account, get the first account for this user
      if (!transactionAccountId) {
        const accounts = await getUserAccounts(user.id)
        if (!accounts || accounts.length === 0) {
          return createErrorResponse('User has no accounts. Please create an account first.', 400)
        }
        transactionAccountId = accounts[0].id;
      }
    }
    
    // Process the date - if provided, use it, otherwise use current date
    let transactionDate: Date;
    if (date) {
      // Handle both ISO string and date input formats
      if (date.includes('T')) {
        // Already an ISO string
        transactionDate = new Date(date);
      } else {
        // Date input format (YYYY-MM-DD), convert to date at midnight
        transactionDate = new Date(date + 'T00:00:00');
      }
    } else {
      // Use current date/time
      transactionDate = new Date();
    }
    
    // Create the transaction using the service function
    const transactionData = {
      account_id: transactionAccountId,
      amount: parseFloat(amount), // Convert string to number
      reason: reason || '',
      type,
      category: category || 'general',
      date: transactionDate.toISOString(),
    }
    
    const data = await createTransaction(transactionData)
    
    return createSuccessResponse(data)
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    return createErrorResponse(error.message || 'An unexpected error occurred', 500)
  }
}