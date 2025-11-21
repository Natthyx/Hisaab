import { createClient } from '@/lib/supabase/server'

// Service functions for user-related business logic

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
  
  return data
}