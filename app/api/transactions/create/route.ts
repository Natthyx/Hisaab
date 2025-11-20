import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const transactionSchema = z.object({
  amount: z.number(),
  reason: z.string().optional(),
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
  date: z.string().optional(), // ISO string or date string from input
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    
    // Validate the request body
    const parsed = transactionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const { amount, reason, type, category, date } = parsed.data
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
        user_id: user.id,
        amount,
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