import { z } from 'zod'
import { 
  getUserFromRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/api/index'
import { createAccount, setDefaultAccount, doesUserHaveAccounts } from '@/lib/accounts/service'

const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  initial_balance: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    // Get the current user
    const { user, error: userError } = await getUserFromRequest(request)
    
    if (userError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }
    
    const formData = await request.formData()
    const name = formData.get('name') as string
    const initialBalance = formData.get('initial_balance') as string || '0'
    
    // Validate the request data
    const parsed = createAccountSchema.safeParse({
      name,
      initial_balance: initialBalance,
    })
    
    if (!parsed.success) {
      return createErrorResponse('Invalid request data', 400)
    }
    
    // Check if user already has accounts
    const userHasAccounts = await doesUserHaveAccounts(user.id)
    
    // Create the account using the service function
    const accountData = {
      user_id: user.id,
      name: parsed.data.name,
      initial_balance: parseFloat(parsed.data.initial_balance || '0') || 0,
    }
    
    const data = await createAccount(accountData)
    
    // If this is the user's first account, set it as default
    if (!userHasAccounts) {
      await setDefaultAccount(user.id, data.id)
    }
    
    // Return success response
    return createSuccessResponse(data)
  } catch (error: any) {
    console.error('Error creating account:', error)
    return createErrorResponse(error.message || 'An unexpected error occurred', 500)
  }
}