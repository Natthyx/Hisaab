import { createClient as createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserAccounts, checkUserHasAccounts } from '@/lib/accounts/service'
import { getCachedUser } from '@/lib/auth/service'

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function checkUserSetupAndRedirect() {
  try {
    // Use cached user instead of calling getUser directly
    const user = await getCachedUser()
    
    if (!user) {
      // User not logged in, stay on login page
      return
    }

    // Check if user has any accounts
    const hasAccounts = await checkUserHasAccounts(user.id)

    // If user has accounts, redirect to dashboard
    if (hasAccounts) {
      redirect("/dashboard")
    } 
    // If user exists but has no accounts, redirect to setup
    else {
      redirect("/setup")
    }
  } catch (error) {
    console.error("Error checking user setup:", error)
  }
}

export async function fetchUserAccounts(userId: string) {
  return await getUserAccounts(userId)
}