import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'

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
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Update cache
  userCache = user
  lastFetchTime = currentTime
  
  return user
}

export function clearUserCache() {
  userCache = null
  lastFetchTime = 0
}

export async function signInWithEmailAndPassword(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  // Clear user cache on successful login
  clearUserCache()

  return data
}

export async function signUpWithEmailAndPassword(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  // After successful signup, create the user profile using service role
  if (data.user) {
    const response = await fetch("/api/auth/create-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: data.user.id,
        email: data.user.email,
      }),
    })

    const result = await response.json()
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to create user profile")
    }
  }

  // Clear user cache on successful signup
  clearUserCache()

  return data
}

export async function updateProfile(userId: string, fullName: string) {
  const supabase = createClient()
  
  // Update the user's full name in our database
  const formData = new FormData()
  formData.append('full_name', fullName)
  
  const response = await fetch('/api/users/update', {
    method: 'POST',
    body: formData,
  })
  
  const result = await response.json()
  
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to update profile')
  }
  
  // Also update the Supabase auth user metadata
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      display_name: fullName
    }
  })
  
  if (updateError) {
    throw new Error('Profile updated in database but failed to update display name')
  }
  
  // Clear user cache when profile is updated
  clearUserCache()
  
  return result
}

export async function changePassword(email: string, currentPassword: string, newPassword: string) {
  const supabase = createClient()
  
  // First, we need to re-authenticate the user with their current password
  // This is required by Supabase to change the password
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: email,
    password: currentPassword,
  })
  
  if (signInError) {
    throw new Error('Current password is incorrect')
  }
  
  // Now update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })
  
  if (updateError) {
    throw new Error(updateError.message || 'Failed to update password')
  }
  
  // Clear user cache when password is changed
  clearUserCache()
  
  return { success: true }
}

export async function fetchUserProfile(userId: string) {
  const supabase = createClient()
  
  // Get user's full name from the users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', userId)
    .single()
  
  if (userError) {
    throw new Error(userError.message)
  }
  
  return userData
}

export async function fetchUserAccounts(userId: string) {
  const supabase = createClient()
  
  // Get user's accounts
  const { data: accountsData, error: accountsError } = await supabase
    .from('accounts')
    .select('id, name')
    .eq('user_id', userId)
    .order('name')
  
  if (accountsError) {
    throw new Error(accountsError.message)
  }
  
  return accountsData || []
}