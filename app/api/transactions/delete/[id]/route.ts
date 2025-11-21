import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Await the params promise to get the actual params
    const { id } = await params
    
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
    
    // Delete the transaction only if it belongs to one of the user's accounts
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .in('account_id', accountIds)
    
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
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