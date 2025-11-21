import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

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
    const supabase = await createClient()
    
    // Await the params promise to get the actual params
    const { id } = await params
    
    // Get form data
    const formData = await request.formData()
    
    // Convert FormData to object (only include fields that are present)
    const body: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        body[key] = value
      }
    }
    
    // Validate the request body
    const parsed = updateTransactionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    // Prepare update data (convert amount to number if present)
    const updateData: Record<string, any> = { ...parsed.data }
    if (updateData.amount) {
      updateData.amount = parseFloat(updateData.amount)
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user's accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', user.id)
    
    if (accountsError) {
      return NextResponse.json(
        { error: 'Failed to get user accounts' },
        { status: 500 }
      )
    }
    
    const accountIds = accounts.map(account => account.id)
    
    // Update the transaction only if it belongs to one of the user's accounts
    const { data, error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .in('account_id', accountIds)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Transaction not found or unauthorized' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}