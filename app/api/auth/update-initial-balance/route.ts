import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { userId, initialBalance } = await req.json()

    // Validate input
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY! // bypasses RLS
    )

    const { error } = await supabase
      .from("users")
      .update({ initial_balance: initialBalance || 0 })
      .eq('id', userId)

    if (error) {
      console.error('Supabase update error:', error)
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}