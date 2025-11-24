import { createClient } from '@/lib/supabase/server'

// Service functions for user-related business logic

// Cache for user data to prevent multiple database calls
let userCache: any = null
let lastFetchTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

export async function getCachedUser() {
  const currentTime = Date.now()
  
  // If we have cached data and it's not expired, return it
  if (userCache && (currentTime - lastFetchTime) < CACHE_DURATION) {
    return userCache
  }
  
  // Otherwise fetch fresh data
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error fetching user:', error)
      // Don't throw error, just return null to indicate no user
      return null
    }
    
    // Update cache
    userCache = user
    lastFetchTime = currentTime
    
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    // Don't throw error, just return null to indicate no user
    return null
  }
}

export function clearUserCache() {
  userCache = null
  lastFetchTime = 0
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<{
  full_name: string | null,
  default_account_id: string
}>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Clear user cache when profile is updated
  clearUserCache()
  
  return data
}

export async function createUserProfile(userId: string, email: string, full_name?: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: email,
      full_name: full_name || null
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function updateInitialBalance(userId: string, initialBalance: number) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .update({ initial_balance: initialBalance })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Clear user cache when balance is updated
  clearUserCache()
  
  return data
}