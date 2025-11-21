import { createClient } from '@/lib/supabase/server'
import { getUserAccounts, getUserDefaultAccount } from "@/lib/accounts/service"

export async function getAccountTransactions(accountId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('date', { ascending: false })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function getAccountTransactionsByDateRange(accountId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function getTransactionById(transactionId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function createTransaction(transactionData: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .insert(transactionData)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function updateTransaction(transactionId: string, transactionData: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .update(transactionData)
    .eq('id', transactionId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function doesTransactionBelongToUserAccounts(transactionId: string, accountIds: string[]) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('id')
    .eq('id', transactionId)
    .in('account_id', accountIds)
    .single()
  
  if (error) {
    return false
  }
  
  return !!data
}

export async function updateTransactionForUser(transactionId: string, updateData: any, userAccountIds: string[]) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', transactionId)
    .in('account_id', userAccountIds)
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  if (!data) {
    throw new Error('Transaction not found or unauthorized')
  }
  
  return data
}

export async function listTransactionsForUser(
  userAccountIds: string[], 
  filters?: {
    search?: string,
    category?: string,
    startDate?: string,
    endDate?: string,
    filter?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  }
) {
  const supabase = await createClient()
  
  // Build the query
  let query = supabase
    .from('transactions')
    .select('*')
    .in('account_id', userAccountIds)
  
  // Apply search filter
  if (filters?.search) {
    query = query.ilike('reason', `%${filters.search}%`)
  }
  
  // Apply category filter
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  
  // Apply date range filter
  if (filters?.startDate) {
    query = query.gte('date', new Date(filters.startDate).toISOString())
  }
  
  if (filters?.endDate) {
    query = query.lte('date', new Date(filters.endDate).toISOString())
  }
  
  // Apply period filter
  const now = new Date()
  if (filters?.filter) {
    let startOfDay, endOfDay
    
    switch (filters.filter) {
      case 'daily':
        startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
        break
      case 'weekly':
        const firstDayOfWeek = new Date(now)
        firstDayOfWeek.setDate(now.getDate() - now.getDay())
        startOfDay = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate())
        endOfDay = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate() + 6, 23, 59, 59, 999)
        break
      case 'monthly':
        startOfDay = new Date(now.getFullYear(), now.getMonth(), 1)
        endOfDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break
      case 'yearly':
        startOfDay = new Date(now.getFullYear(), 0, 1)
        endOfDay = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
        break
    }
    
    if (startOfDay && endOfDay) {
      query = query.gte('date', startOfDay.toISOString())
      query = query.lte('date', endOfDay.toISOString())
    }
  }
  
  // Order by date descending
  const { data, error } = await query
    .order('date', { ascending: false })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function getTransactionsPageData(userId: string, accountId?: string) {
  // Get user's accounts
  const accounts = await getUserAccounts(userId)
  
  // Determine which account to show
  let selectedAccountId = accountId
  
  // If no account specified, use user's default account or first account
  if (!selectedAccountId && accounts && accounts.length > 0) {
    // Get user's default account
    const userData = await getUserDefaultAccount(userId)
    
    if (userData?.default_account_id) {
      selectedAccountId = userData.default_account_id
    } else {
      selectedAccountId = accounts[0].id
    }
  }
  
  // Get transactions for the selected account
  const transactions = selectedAccountId 
    ? await getAccountTransactions(selectedAccountId) 
    : []
  
  return {
    accounts,
    selectedAccountId,
    transactions
  }
}