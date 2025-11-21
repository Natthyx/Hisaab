import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY! // bypasses RLS
    )

    // Try to insert the user profile
    const { error } = await supabase
      .from("users")
      .upsert([
        { 
          id: userId, 
          email: email,
          full_name: null,
          default_account_id: null,
          created_at: new Date().toISOString()
        }
      ], {
        onConflict: 'id'
      })

    if (error) {
      console.error('Error creating user profile:', error)
      // If the error is due to a missing table, we should provide a more helpful message
      if (error.message.includes('relation') || error.message.includes('table')) {
        return Response.json({ 
          error: 'Database schema not set up. Please run the database schema script.', 
          details: error.message 
        }, { status: 400 })
      }
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 })
  }
}