import { 
  getUserFromRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/api/index'
import { doesAccountBelongToUser, setDefaultAccount } from '@/lib/accounts/service'

export async function POST(request: Request) {
  try {
    // Get the current user
    const { user, error: userError } = await getUserFromRequest(request)
    
    if (userError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }
    
    const formData = await request.formData()
    const accountId = formData.get('accountId') as string
    
    if (!accountId) {
      return createErrorResponse('Account ID is required', 400)
    }
    
    // Verify that the account belongs to the user using the service function
    const accountBelongsToUser = await doesAccountBelongToUser(accountId, user.id)
    if (!accountBelongsToUser) {
      return createErrorResponse('Account not found or unauthorized', 404)
    }
    
    // Set the account as default using the service function
    await setDefaultAccount(user.id, accountId)
    
    // Return success response
    return createSuccessResponse()
  } catch (error: any) {
    console.error('Error setting default account:', error)
    return createErrorResponse(error.message || 'An unexpected error occurred', 500)
  }
}