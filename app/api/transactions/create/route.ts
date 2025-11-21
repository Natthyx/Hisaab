import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

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
    const supabase = await createClient()
    
    // Get form data
    const formData = await request.formData()
    
    // Convert FormData to object
    const body = {
      amount: formData.get('amount') as string,
      reason: formData.get('reason') as string || undefined,
      type: formData.get('type') as string,
      category: formData.get('category') as string || undefined,
      date: formData.get('date') as string || undefined,
      accountId: formData.get('accountId') as string || undefined,
    }
    
    // Validate the request body
    const parsed = transactionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const { amount, reason, type, category, date, accountId } = parsed.data
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the account ID - either provided or use user's default account
    let transactionAccountId = accountId;
    
    if (!transactionAccountId) {
      // Get user's default account
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('default_account_id')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        return NextResponse.json(
          { error: 'Failed to get user data' },
          { status: 500 }
        )
      }
      
      transactionAccountId = userData?.default_account_id;
      
      // If no default account, get the first account for this user
      if (!transactionAccountId) {
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .single()
        
        if (accountError) {
          return NextResponse.json(
            { error: 'User has no accounts. Please create an account first.' },
            { status: 400 }
          )
        }
        
        transactionAccountId = accountData.id;
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
    
    // Insert the transaction
    const { data, error: insertError } = await supabase
      .from('transactions')
      .insert({
        account_id: transactionAccountId,
        amount: parseFloat(amount), // Convert string to number
        reason: reason || '',
        type,
        category: category || 'general',
        date: transactionDate.toISOString(),
      })
      .select()
      .single()
    
    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
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