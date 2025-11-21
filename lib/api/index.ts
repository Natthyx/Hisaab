import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Common API utilities for consistent error handling and response formatting

export async function getUserFromRequest(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, error: 'Unauthorized' }
  }
  
  return { user, error: null }
}

export async function getUserAccounts(userId: string) {
  const supabase = await createClient()
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
  
  if (error) {
    return { accounts: null, error: 'Failed to get user accounts' }
  }
  
  return { accounts, error: null }
}

export function createSuccessResponse(data: any = null) {
  return NextResponse.json({ success: true, data })
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function validateFormData(formData: FormData, schema: any) {
  // Convert FormData to object
  const body: Record<string, any> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      body[key] = value
    }
  }
  
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return { 
      isValid: false, 
      error: 'Invalid request body', 
      details: parsed.error.flatten() 
    }
  }
  
  return { isValid: true, data: parsed.data }
}

export async function validateTransactionOwnership(
  userId: string, 
  transactionId: string
) {
  const supabase = await createClient()
  
  // Get user's accounts
  const { accounts, error: accountsError } = await getUserAccounts(userId)
  
  if (accountsError) {
    return { isValid: false, error: accountsError }
  }
  
  const accountIds = accounts!.map(account => account.id)
  
  // Check if transaction belongs to one of the user's accounts
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select('id')
    .eq('id', transactionId)
    .in('account_id', accountIds)
    .single()
  
  if (transactionError || !transaction) {
    return { isValid: false, error: 'Transaction not found or unauthorized' }
  }
  
  return { isValid: true, error: null }
}