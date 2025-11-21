import { createClient } from '@/lib/supabase/server'

export async function getUserAccounts(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  
  if (error) {
    throw new Error(error.message)
  }
  
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
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('default_account_id')
    .eq('id', userId)
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function createAccount(accountData: any) {
  const supabase = await createClient()
  
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
  
  // Set this account as default for the user
  const result = await setDefaultAccount(account.user_id, accountId)
  
  return result
}