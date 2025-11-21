import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
    const accountId = formData.get('accountId') as string
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }
    
    // Verify that the account belongs to the user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()
    
    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found or unauthorized' },
        { status: 404 }
      )
    }
    
    // Check if this is the default account
    const { data: userData, error: userError2 } = await supabase
      .from('users')
      .select('default_account_id')
      .eq('id', user.id)
      .single()
    
    // Delete the account (transactions will be deleted due to CASCADE)
    const { error: deleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id)
    
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }
    
    // If this was the default account, clear the default account ID
    if (!userError2 && userData?.default_account_id === accountId) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ default_account_id: null })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Error clearing default account:', updateError)
      }
    }
    
    // Return success response like transaction APIs
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}