import { Account } from '@/types'
import { 
  getUserFromRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/api/index'
import { listTransactionsForUser } from '@/lib/transactions/service'
import { getAccountById, getUserAccounts } from '@/lib/accounts/service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filter = searchParams.get('filter') as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const accountId = searchParams.get('accountId') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    
    // Get the current user
    const { user, error: userError } = await getUserFromRequest(request)
    
    if (userError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }
    
    // Get user's accounts
    let accountIds: string[] = []
    
    if (accountId) {
      // If specific account requested, verify it belongs to user using service function
      const account = await getAccountById(accountId)
      if (!account || account.user_id !== user.id) {
        return createErrorResponse('Account not found or unauthorized', 404)
      }
      
      accountIds = [accountId]
    } else {
      // Get all user's accounts using service function
      const accounts = await getUserAccounts(user.id)
      accountIds = accounts.map((account: Account) => account.id)
    }
    
    // List transactions using the service function
    const filters = {
      search,
      category,
      startDate,
      endDate,
      filter
    }
    
    const data = await listTransactionsForUser(accountIds, filters)
    
    return createSuccessResponse(data)
  } catch (error: any) {
    console.error('Error listing transactions:', error)
    return createErrorResponse(error.message || 'An unexpected error occurred', 500)
  }
}