import { createClient } from '@/lib/supabase/server'

// Simple in-memory cache for user data during a single request
let cachedUser: { id: string } | null = null
let cachedUserData: any = null

/**
 * Get the current authenticated user with caching to avoid redundant calls
 * within the same request lifecycle
 */
export async function getCurrentUser() {
  // Return cached user if available
  if (cachedUser) {
    return cachedUser
  }
  
  // Fetch user from Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Cache the user data
  if (user) {
    cachedUser = { id: user.id }
    return cachedUser
  }
  
  return null
}

/**
 * Get extended user data with caching
 */
export async function getCurrentUserWithProfile() {
  // Return cached user data if available
  if (cachedUserData) {
    return cachedUserData
  }
  
  const user = await getCurrentUser()
  if (!user) {
    return null
  }
  
  // Fetch user profile data
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('full_name, default_account_id')
    .eq('id', user.id)
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Cache the extended user data
  cachedUserData = {
    ...user,
    full_name: data.full_name,
    default_account_id: data.default_account_id
  }
  
  return cachedUserData
}