import { NextResponse } from 'next/server'
import { updateUserProfile } from '@/lib/auth/service'
import { createClient } from '@/lib/supabase/server'

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
    const fullName = formData.get('full_name') as string
    
    // Update the user's full name using the service function
    await updateUserProfile(user.id, { full_name: fullName || null })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}