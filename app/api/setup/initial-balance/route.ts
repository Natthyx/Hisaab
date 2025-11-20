import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const initialBalanceSchema = z.object({
  initialBalance: z.number().min(0),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    
    // Validate the request body
    const parsed = initialBalanceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const { initialBalance } = parsed.data
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Update the user's initial balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ initial_balance: initialBalance })
      .eq('id', user.id)
    
    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}