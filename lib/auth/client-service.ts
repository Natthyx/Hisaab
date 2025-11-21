import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'

export async function signInWithEmailAndPassword(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

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