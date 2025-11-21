import { z } from 'zod'
import { 
  getUserFromRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/api/index'
import { setupUserAccount } from '@/lib/accounts/service'

const setupAccountSchema = z.object({
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
    
    const body = await request.json()
    const name = body.name as string
    const initialBalance = body.initial_balance as string || '0'
    
    // Validate the request data
    const parsed = setupAccountSchema.safeParse({
      name,
      initial_balance: initialBalance,
    })
    
    if (!parsed.success) {
      return createErrorResponse('Invalid request data', 400)
    }
    
    // Setup the user's initial account using the service function
    const accountData = await setupUserAccount(
      user.id,
      parsed.data.name,
      parseFloat(parsed.data.initial_balance || '0') || 0
    )
    
    // Return success response
    return createSuccessResponse(accountData)
  } catch (error: any) {
    console.error('Error setting up account:', error)
    return createErrorResponse(error.message || 'An unexpected error occurred', 500)
  }
}