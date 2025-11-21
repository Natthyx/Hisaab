import { 
  getUserFromRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/api/index'
import { deleteAccount, doesAccountBelongToUser, getUserDefaultAccount, clearDefaultAccount } from '@/lib/accounts/service'

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
    
    // Verify that the account belongs to the user
    const accountBelongsToUser = await doesAccountBelongToUser(accountId, user.id)
    if (!accountBelongsToUser) {
      return createErrorResponse('Account not found or unauthorized', 404)
    }
    
    // Check if this is the default account
    const userData = await getUserDefaultAccount(user.id)
    
    // Delete the account using the service function
    await deleteAccount(accountId)
    
    // If this was the default account, clear the default account ID
    if (userData?.default_account_id === accountId) {
      try {
        await clearDefaultAccount(user.id)
      } catch (updateError) {
        console.error('Error clearing default account:', updateError)
      }
    }
    
    // Return success response
    return createSuccessResponse()
  } catch (error: any) {
    console.error('Error deleting account:', error)
    return createErrorResponse(error.message || 'An unexpected error occurred', 500)
  }
}