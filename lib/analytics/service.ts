// Analytics service for calculations and business logic
import { createClient } from '@/lib/supabase/server'

// Helper functions for date formatting
export const formatDailyDate = (dateString: string) => {
  const date = new Date(dateString)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[date.getDay()]
}

export const formatWeeklyDate = (dateString: string, index: number) => {
  return `Week ${index + 1}`
}

export const formatMonthlyDate = (dateString: string) => {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[date.getMonth()]
}

export const formatYearlyDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.getFullYear().toString()
}

// Helper function to calculate savings rate
export const calculateSavingsRate = (income: number, expense: number) => {
  if (income === 0) return 0
  return ((income - expense) / income) * 100
}

// Helper function to find biggest expense category
export const findBiggestExpenseCategory = (transactions: any[]) => {
  const categoryTotals: { [key: string]: number } = {}
  
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0
      }
      categoryTotals[transaction.category] += transaction.amount
    }
  })
  
  let biggestCategory = ''
  let maxAmount = 0
  
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount
      biggestCategory = category
    }
  })
  
  return { category: biggestCategory, amount: maxAmount }
}

// Helper function to detect recurring expenses
export const detectRecurringExpenses = (transactions: any[]) => {
  const recurring: { [key: string]: { amount: number, frequency: string, count: number } } = {}
  
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      const key = `${transaction.reason || transaction.category}`
      if (!recurring[key]) {
        recurring[key] = { amount: 0, frequency: '', count: 0 }
      }
      recurring[key].amount += transaction.amount
      recurring[key].count += 1
    }
  })
  
  // Filter for likely recurring expenses (appearing more than once)
  const likelyRecurring = Object.entries(recurring)
    .filter(([_, data]) => data.count > 1)
    .map(([name, data]) => ({
      name,
      amount: data.amount / data.count, // Average amount
      frequency: data.count > 4 ? 'Weekly' : data.count > 1 ? 'Monthly' : 'Occasional',
      total: data.amount
    }))
  
  return likelyRecurring
}

// Helper function to calculate running balance
export const calculateRunningBalance = (initialBalance: number, transactions: any[]) => {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  const balanceData: { date: string; balance: number }[] = []
  let currentBalance = initialBalance
  
  sortedTransactions.forEach(transaction => {
    if (transaction.type === 'income') {
      currentBalance += transaction.amount
    } else {
      currentBalance -= transaction.amount
    }
    
    balanceData.push({
      date: transaction.date,
      balance: currentBalance
    })
  })
  
  return balanceData
}

// Helper function to get top spending/earning days
export const getTopDays = (transactions: any[], type: 'income' | 'expense', limit: number = 5) => {
  const dayTotals: { [key: string]: number } = {}
  
  transactions.forEach(transaction => {
    if (transaction.type === type) {
      const date = new Date(transaction.date).toDateString()
      if (!dayTotals[date]) {
        dayTotals[date] = 0
      }
      dayTotals[date] += transaction.amount
    }
  })
  
  return Object.entries(dayTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([date, amount]) => ({ date, amount }))
}

// Generate daily chart data (Mon-Sun)
export const generateDailyData = (transactions: any[], now: Date = new Date()) => {
  const dailyData = []
  const firstDayOfWeek = new Date(now)
  firstDayOfWeek.setDate(now.getDate() - now.getDay())
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(firstDayOfWeek)
    day.setDate(firstDayOfWeek.getDate() + i)
    
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)
    
    let dayIncome = 0
    let dayExpense = 0
    
    transactions?.forEach(transaction => {
      const transactionDate = new Date(transaction.date)
      if (transactionDate >= dayStart && transactionDate <= dayEnd) {
        if (transaction.type === 'income') {
          dayIncome += transaction.amount
        } else {
          dayExpense += transaction.amount
        }
      }
    })
    
    dailyData.push({
      day: formatDailyDate(dayStart.toISOString()),
      income: dayIncome,
      expense: dayExpense,
      net: dayIncome - dayExpense
    })
  }
  
  return dailyData
}

// Generate category breakdown data
export const generateCategoryData = (transactions: any[]) => {
  const categoryData: { name: string; value: number; color: string }[] = []
  const categoryColors = [
    '#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b'
  ]
  
  const categoryTotals: { [key: string]: number } = {}
  
  transactions?.forEach(transaction => {
    if (transaction.type === 'expense') {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0
      }
      categoryTotals[transaction.category] += transaction.amount
    }
  })
  
  let colorIndex = 0
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    categoryData.push({
      name: category,
      value: amount,
      color: categoryColors[colorIndex % categoryColors.length]
    })
    colorIndex++
  })
  
  return categoryData
}

// Generate monthly trend data
export const generateMonthlyTrendData = (transactions: any[], now: Date = new Date()) => {
  const monthlyTrendData = []
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(startOfYear.getFullYear(), i, 1)
    const monthEnd = new Date(startOfYear.getFullYear(), i + 1, 0, 23, 59, 59, 999)
    
    const monthTransactions = transactions?.filter(t => 
      new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
    ) || []
    
    let monthIncome = 0
    let monthExpense = 0
    
    monthTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        monthIncome += transaction.amount
      } else {
        monthExpense += transaction.amount
      }
    })
    
    monthlyTrendData.push({
      month: formatMonthlyDate(monthStart.toISOString()),
      income: monthIncome,
      expense: monthExpense
    })
  }
  
  return monthlyTrendData
}

// Daily analytics for a specific account
export async function dailyAnalytics(accountId: string) {
  const supabase = await createClient()
  
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  
  // Get today's transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
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
    .eq('account_id', accountId)
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

// Weekly analytics for a specific account
export async function weeklyAnalytics(accountId: string) {
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
    .eq('account_id', accountId)
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
    .eq('account_id', accountId)
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

// Monthly analytics for a specific account
export async function monthlyAnalytics(accountId: string) {
  const supabase = await createClient()
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  // Get this month's transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
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
    .eq('account_id', accountId)
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

// Yearly analytics for a specific account
export async function yearlyAnalytics(accountId: string) {
  const supabase = await createClient()
  
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
  
  // Get this year's transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
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
    .eq('account_id', accountId)
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