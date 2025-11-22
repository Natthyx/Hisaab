import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from "@/lib/auth/user-service"

// Simple in-memory cache for accounts data during a single request
let cachedAccounts: any[] | null = null
let cachedDefaultAccount: any = null

export async function getUserAccounts(userId: string) {
  // Return cached accounts if available and for the same user
  if (cachedAccounts) {
    return cachedAccounts
  }
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Cache the accounts data
  cachedAccounts = data
  
  return data
}

export async function getAccountById(accountId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function getUserDefaultAccount(userId: string) {
  // Return cached default account if available and for the same user
  if (cachedDefaultAccount) {
    return cachedDefaultAccount
  }
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('default_account_id')
    .eq('id', userId)
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Cache the default account data
  cachedDefaultAccount = data
  
  return data
}

export async function createAccount(accountData: any) {
  const supabase = await createClient()
  
  // Clear cache when creating a new account
  cachedAccounts = null
  cachedDefaultAccount = null
  
  const { data, error } = await supabase
    .from('accounts')
    .insert(accountData)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function updateAccount(accountId: string, accountData: any) {
  const supabase = await createClient()
  
  // Clear cache when updating an account
  cachedAccounts = null
  cachedDefaultAccount = null
  
  const { data, error } = await supabase
    .from('accounts')
    .update(accountData)
    .eq('id', accountId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function deleteAccount(accountId: string) {
  const supabase = await createClient()
  
  // Clear cache when deleting an account
  cachedAccounts = null
  cachedDefaultAccount = null
  
  const { data, error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function setDefaultAccount(userId: string, accountId: string) {
  const supabase = await createClient()
  
  // Clear cache when setting default account
  cachedDefaultAccount = null
  
  const { data, error } = await supabase
    .from('users')
    .update({ default_account_id: accountId })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function doesUserHaveAccounts(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data && data.length > 0
}

export async function doesAccountBelongToUser(accountId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single()
  
  if (error) {
    return false
  }
  
  return !!data
}

export async function clearDefaultAccount(userId: string) {
  const supabase = await createClient()
  
  // Clear cache when clearing default account
  cachedDefaultAccount = null
  
  const { data, error } = await supabase
    .from('users')
    .update({ default_account_id: null })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function checkUserHasAccounts(userId: string) {
  try {
    const accounts = await getUserAccounts(userId)
    return accounts && accounts.length > 0
  } catch (error) {
    return false
  }
}

export async function setupUserAccount(userId: string, accountName: string, initialBalance: number) {
  const supabase = await createClient()
  
  // Clear cache when setting up user account
  cachedAccounts = null
  cachedDefaultAccount = null
  
  // Create the initial account
  const { data: accountData, error: accountError } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      name: accountName,
      initial_balance: initialBalance || 0,
    })
    .select()
    .single()

  if (accountError) {
    throw new Error(accountError.message)
  }

  // Set this as the default account
  const { error: updateError } = await supabase
    .from('users')
    .update({ default_account_id: accountData.id })
    .eq('id', userId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  return accountData
}

export async function setAccountAsDefault(accountId: string) {
  // This function would need to know the userId, so let's create a more complete version
  // that handles the entire process of setting an account as default
  const supabase = await createClient()
  
  // First, we need to get the account to find the user_id
  const account = await getAccountById(accountId)
  if (!account) {
    throw new Error('Account not found')
  }
  
  // Clear cache when setting account as default
  cachedDefaultAccount = null
  
  // Set this account as default for the user
  const result = await setDefaultAccount(account.user_id, accountId)
  
  return result
}

// New functions that get the user ID internally
export async function getUserAccountsWithCurrentUser() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  return await getUserAccounts(user.id)
}

export async function getUserDefaultAccountForCurrentUser() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  return await getUserDefaultAccount(user.id)
}

export async function checkUserHasAccountsWithCurrentUser() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  return await checkUserHasAccounts(user.id)
}