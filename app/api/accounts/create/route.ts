import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  initial_balance: z.string().optional(),
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
    
    const formData = await request.formData()
    const name = formData.get('name') as string
    const initialBalance = formData.get('initial_balance') as string || '0'
    
    // Validate the request data
    const parsed = createAccountSchema.safeParse({
      name,
      initial_balance: initialBalance,
    })
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    // Check if user has any existing accounts
    const { data: existingAccounts, error: countError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', user.id)
    
    const isFirstAccount = !countError && (!existingAccounts || existingAccounts.length === 0)
    
    // Create the account
    const { data, error: insertError } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: parsed.data.name,
        initial_balance: parseFloat(parsed.data.initial_balance || '0') || 0,
      })
      .select()
      .single()
    
    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }
    
    // If this is the user's first account, set it as default
    if (isFirstAccount) {
      // This is the first account, set it as default
      const { error: updateError } = await supabase
        .from('users')
        .update({ default_account_id: data.id })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Error setting default account:', updateError)
      }
    }
    
    // Return success response like transaction APIs
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}