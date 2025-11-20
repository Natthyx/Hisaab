import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { userId, email, initialBalance } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY! // bypasses RLS
    )

    const { error } = await supabase
      .from("users")
      .insert([
        { 
          id: userId, 
          email,
          initial_balance: initialBalance || 0
        }
      ])

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}