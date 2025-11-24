import { NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  getUserFromRequest, 
  createSuccessResponse, 
  createErrorResponse,
  validateFormData
} from '@/lib/api/index'
import { updateTransactionForUser } from '@/lib/transactions/service'
import { getUserAccounts } from '@/lib/accounts/service'
import { Account } from '@/types'

const updateTransactionSchema = z.object({
  amount: z.string().optional(), // Changed to string since FormData sends strings
  reason: z.string().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  date: z.string().optional(), // ISO string
  accountId: z.string().optional(), // Optional account ID
})

export async function PUT(
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
    
    // Get form data
    const formData = await request.formData()
    
    // Validate the request body
    const validation = validateFormData(formData, updateTransactionSchema)
    if (!validation.isValid) {
      return createErrorResponse('Invalid request body', 400)
    }
    
    // Prepare update data (convert amount to number if present)
    const updateData: Record<string, any> = { ...validation.data }
    if (updateData.amount) {
      updateData.amount = parseFloat(updateData.amount)
    }
    
    // Get user's accounts using the service function
    const accounts = await getUserAccounts(user.id)
    const accountIds = accounts.map((account: Account) => account.id)
    
    // Update the transaction using the service function
    const data = await updateTransactionForUser(id, updateData, accountIds)
    
    return createSuccessResponse(data)
  } catch (error: any) {
    console.error('Error updating transaction:', error)
    return createErrorResponse(error.message || 'An unexpected error occurred', 500)
  }
}