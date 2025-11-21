import { NextResponse } from 'next/server'
import { z } from 'zod'
import { updateInitialBalance } from '@/lib/auth/service'
import { createClient } from '@/lib/supabase/server'

const initialBalanceSchema = z.object({
  initialBalance: z.number().min(0),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
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
    
    // Update the user's initial balance using the service function
    await updateInitialBalance(user.id, initialBalance)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating initial balance:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}