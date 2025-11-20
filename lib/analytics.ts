import { createClient } from '@/lib/supabase/server'

export async function dailyAnalytics(userId: string) {
  const supabase = await createClient()
  
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  
  // Get today's transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startOfDay.toISOString())
    .lte('date', endOfDay.toISOString())
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Calculate totals
  let totalIncome = 0
  let totalExpense = 0
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount
    } else {
      totalExpense += transaction.amount
    }
  })
  
  const net = totalIncome - totalExpense
  
  // Get previous day's data for comparison
  const previousStart = new Date(startOfDay)
  previousStart.setDate(previousStart.getDate() - 1)
  
  const previousEnd = new Date(endOfDay)
  previousEnd.setDate(previousEnd.getDate() - 1)
  
  const { data: previousTransactions, error: previousError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', previousStart.toISOString())
    .lte('date', previousEnd.toISOString())
  
  let previousTotalIncome = 0
  let previousTotalExpense = 0
  
  if (!previousError && previousTransactions) {
    previousTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        previousTotalIncome += transaction.amount
      } else {
        previousTotalExpense += transaction.amount
      }
    })
  }
  
  const previousNet = previousTotalIncome - previousTotalExpense
  const previousPeriodComparison = net - previousNet
  
  // Prepare graph data (simplified for daily)
  const graphData = [{
    date: startOfDay.toISOString(),
    income: totalIncome,
    expense: totalExpense
  }]
  
  return {
    totalIncome,
    totalExpense,
    net,
    previousPeriodComparison,
    graphData
  }
}

export async function weeklyAnalytics(userId: string) {
  const supabase = await createClient()
  
  const now = new Date()
  const firstDayOfWeek = new Date(now)
  firstDayOfWeek.setDate(now.getDate() - now.getDay())
  
  const startOfWeek = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate())
  const endOfWeek = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate() + 6, 23, 59, 59, 999)
  
  // Get this week's transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startOfWeek.toISOString())
    .lte('date', endOfWeek.toISOString())
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Calculate totals
  let totalIncome = 0
  let totalExpense = 0
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount
    } else {
      totalExpense += transaction.amount
    }
  })
  
  const net = totalIncome - totalExpense
  
  // Get previous week's data for comparison
  const previousStart = new Date(startOfWeek)
  previousStart.setDate(previousStart.getDate() - 7)
  
  const previousEnd = new Date(endOfWeek)
  previousEnd.setDate(previousEnd.getDate() - 7)
  
  const { data: previousTransactions, error: previousError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', previousStart.toISOString())
    .lte('date', previousEnd.toISOString())
  
  let previousTotalIncome = 0
  let previousTotalExpense = 0
  
  if (!previousError && previousTransactions) {
    previousTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        previousTotalIncome += transaction.amount
      } else {
        previousTotalExpense += transaction.amount
      }
    })
  }
  
  const previousNet = previousTotalIncome - previousTotalExpense
  const previousPeriodComparison = net - previousNet
  
  // Prepare graph data (by day of week)
  const graphData = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(day.getDate() + i)
    
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)
    
    const dayTransactions = transactions.filter(t => 
      new Date(t.date) >= dayStart && new Date(t.date) <= dayEnd
    )
    
    let dayIncome = 0
    let dayExpense = 0
    
    dayTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        dayIncome += transaction.amount
      } else {
        dayExpense += transaction.amount
      }
    })
    
    graphData.push({
      date: dayStart.toISOString(),
      income: dayIncome,
      expense: dayExpense
    })
  }
  
  return {
    totalIncome,
    totalExpense,
    net,
    previousPeriodComparison,
    graphData
  }
}

export async function monthlyAnalytics(userId: string) {
  const supabase = await createClient()
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  // Get this month's transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startOfMonth.toISOString())
    .lte('date', endOfMonth.toISOString())
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Calculate totals
  let totalIncome = 0
  let totalExpense = 0
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount
    } else {
      totalExpense += transaction.amount
    }
  })
  
  const net = totalIncome - totalExpense
  
  // Get previous month's data for comparison
  const previousStart = new Date(startOfMonth)
  previousStart.setMonth(previousStart.getMonth() - 1)
  
  const previousEnd = new Date(endOfMonth)
  previousEnd.setMonth(previousEnd.getMonth() - 1)
  
  const { data: previousTransactions, error: previousError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', previousStart.toISOString())
    .lte('date', previousEnd.toISOString())
  
  let previousTotalIncome = 0
  let previousTotalExpense = 0
  
  if (!previousError && previousTransactions) {
    previousTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        previousTotalIncome += transaction.amount
      } else {
        previousTotalExpense += transaction.amount
      }
    })
  }
  
  const previousNet = previousTotalIncome - previousTotalExpense
  const previousPeriodComparison = net - previousNet
  
  // Prepare graph data (by week of month)
  const graphData = []
  const weeksInMonth = Math.ceil((endOfMonth.getDate() - startOfMonth.getDate() + 1) / 7)
  
  for (let i = 0; i < weeksInMonth; i++) {
    const weekStart = new Date(startOfMonth)
    weekStart.setDate(startOfMonth.getDate() + (i * 7))
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    if (weekEnd > endOfMonth) weekEnd.setTime(endOfMonth.getTime())
    
    const weekTransactions = transactions.filter(t => 
      new Date(t.date) >= weekStart && new Date(t.date) <= weekEnd
    )
    
    let weekIncome = 0
    let weekExpense = 0
    
    weekTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        weekIncome += transaction.amount
      } else {
        weekExpense += transaction.amount
      }
    })
    
    graphData.push({
      date: weekStart.toISOString(),
      income: weekIncome,
      expense: weekExpense
    })
  }
  
  return {
    totalIncome,
    totalExpense,
    net,
    previousPeriodComparison,
    graphData
  }
}

export async function yearlyAnalytics(userId: string) {
  const supabase = await createClient()
  
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
  
  // Get this year's transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startOfYear.toISOString())
    .lte('date', endOfYear.toISOString())
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Calculate totals
  let totalIncome = 0
  let totalExpense = 0
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount
    } else {
      totalExpense += transaction.amount
    }
  })
  
  const net = totalIncome - totalExpense
  
  // Get previous year's data for comparison
  const previousStart = new Date(startOfYear)
  previousStart.setFullYear(previousStart.getFullYear() - 1)
  
  const previousEnd = new Date(endOfYear)
  previousEnd.setFullYear(previousEnd.getFullYear() - 1)
  
  const { data: previousTransactions, error: previousError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', previousStart.toISOString())
    .lte('date', previousEnd.toISOString())
  
  let previousTotalIncome = 0
  let previousTotalExpense = 0
  
  if (!previousError && previousTransactions) {
    previousTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        previousTotalIncome += transaction.amount
      } else {
        previousTotalExpense += transaction.amount
      }
    })
  }
  
  const previousNet = previousTotalIncome - previousTotalExpense
  const previousPeriodComparison = net - previousNet
  
  // Prepare graph data (by month)
  const graphData = []
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(startOfYear.getFullYear(), i, 1)
    const monthEnd = new Date(startOfYear.getFullYear(), i + 1, 0, 23, 59, 59, 999)
    
    const monthTransactions = transactions.filter(t => 
      new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
    )
    
    let monthIncome = 0
    let monthExpense = 0
    
    monthTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        monthIncome += transaction.amount
      } else {
        monthExpense += transaction.amount
      }
    })
    
    graphData.push({
      date: monthStart.toISOString(),
      income: monthIncome,
      expense: monthExpense
    })
  }
  
  return {
    totalIncome,
    totalExpense,
    net,
    previousPeriodComparison,
    graphData
  }
}