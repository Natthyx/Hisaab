import { NextResponse } from 'next/server'
import { 
  getUserFromRequest, 
  createSuccessResponse, 
  createErrorResponse
} from '@/lib/api/index'
import { deleteTransaction, doesTransactionBelongToUserAccounts } from '@/lib/transactions/service'
import { getUserAccounts } from '@/lib/accounts/service'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise to get the actual params
    const { id } = await params
    
    // Get the current user
    const { user, error: userError } = await getUserFromRequest(request)
    
    if (userError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }
    
    // Get user's accounts using the service function
    const accounts = await getUserAccounts(user.id)
    
    const accountIds = accounts.map(account => account.id)
    
    // Verify that the transaction belongs to one of the user's accounts
    const transactionBelongsToUser = await doesTransactionBelongToUserAccounts(id, accountIds)
    if (!transactionBelongsToUser) {
      return createErrorResponse('Transaction not found or unauthorized', 404)
    }
    
    // Delete the transaction using the service function
    await deleteTransaction(id)
    
    return createSuccessResponse()
  } catch (error: any) {
    console.error('Error deleting transaction:', error)
    return createErrorResponse(error.message || 'An unexpected error occurred', 500)
  }
}