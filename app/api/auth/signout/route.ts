import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { clearUserCache } from '@/lib/auth/service'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Clear user cache on signout
  clearUserCache()
  
  redirect('/login')
}