import { getAccountTransactions, getAccountTransactionsByDateRange } from "@/lib/transactions/service"
import { getUserAccounts, getUserDefaultAccount, getAccountById } from "@/lib/accounts/service"

// Helper function to format dates for daily chart
const formatDailyDate = (dateString: string) => {
  const date = new Date(dateString)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[date.getDay()]
}

// Helper function to format dates for weekly chart
const formatWeeklyDate = (dateString: string, index: number) => {
  return `Week ${index + 1}`
}

// Helper function to format dates for monthly chart
const formatMonthlyDate = (dateString: string) => {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug','Sep', 'Oct', 'Nov', 'Dec']
  return months[date.getMonth()]
}

// Helper function to get the start and end dates for the current week
const getCurrentWeekDates = () => {
  const now = new Date()
  const firstDayOfWeek = new Date(now)
  firstDayOfWeek.setDate(now.getDate() - now.getDay())
  
  const lastDayOfWeek = new Date(firstDayOfWeek)
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6)
  
  return {
    start: firstDayOfWeek,
    end: lastDayOfWeek
  }
}

// Helper function to get the start and end dates for the previous week
const getPreviousWeekDates = () => {
  const now = new Date()
  const firstDayOfWeek = new Date(now)
  firstDayOfWeek.setDate(now.getDate() - now.getDay() - 7)
  
  const lastDayOfWeek = new Date(firstDayOfWeek)
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6)
  
  return {
    start: firstDayOfWeek,
    end: lastDayOfWeek
  }
}

export async function getDashboardData(userId: string, accountId?: string, dateRange: 'current' | 'previous' = 'current') {
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
  
  // Get selected account details
  const selectedAccount = accounts?.find(account => account.id === selectedAccountId) || accounts?.[0]
  
  // Get date range for filtering transactions
  let startDate, endDate
  if (dateRange === 'previous') {
    const previousWeek = getPreviousWeekDates()
    startDate = previousWeek.start
    endDate = previousWeek.end
  } else {
    const currentWeek = getCurrentWeekDates()
    startDate = currentWeek.start
    endDate = currentWeek.end
  }
  
  // Get transactions for the selected account within the date range (for charts)
  const transactions = selectedAccountId 
    ? await getAccountTransactionsByDateRange(
        selectedAccountId, 
        startDate.toISOString(), 
        endDate.toISOString()
      )
    : []
  
  // Get ALL transactions for the selected account (for real bank account balance calculation)
  const allTransactions = selectedAccountId 
    ? await getAccountTransactions(selectedAccountId)
    : []
  
  // Calculate income and expense for ALL transactions (real bank account balance)
  let totalAllTimeIncome = 0
  let totalAllTimeExpense = 0
  
  allTransactions?.forEach(transaction => {
    if (transaction.type === 'income') {
      totalAllTimeIncome += transaction.amount
    } else {
      totalAllTimeExpense += transaction.amount
    }
  })
  
  // Real bank account balance calculation (includes all historical transactions)
  const balance = (selectedAccount?.initial_balance || 0) + totalAllTimeIncome - totalAllTimeExpense
  
  // Calculate income and expense for the selected date range (for dashboard display)
  let totalIncome = 0
  let totalExpense = 0
  
  transactions?.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount
    } else {
      totalExpense += transaction.amount
    }
  })
  
  // Generate daily chart data (Mon-Sun) for the selected week
  const dailyData = []
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + i)
    
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
      expense: dayExpense
    })
  }
  
  // Generate weekly chart data (Week 1 - Week 4)
  const weeklyData = []
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  const weeksInMonth = Math.ceil((endOfMonth.getDate() - startOfMonth.getDate() + 1) / 7)
  
  for (let i = 0; i < Math.min(weeksInMonth, 4); i++) { // Limit to 4 weeks
    const weekStart = new Date(startOfMonth)
    weekStart.setDate(startOfMonth.getDate() + (i * 7))
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    if (weekEnd > endOfMonth) weekEnd.setTime(endOfMonth.getTime())
    
    const weekTransactions = transactions?.filter(t => 
      new Date(t.date) >= weekStart && new Date(t.date) <= weekEnd
    ) || []
    
    let weekIncome = 0
    let weekExpense = 0
    
    weekTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        weekIncome += transaction.amount
      } else {
        weekExpense += transaction.amount
      }
    })
    
    weeklyData.push({
      week: formatWeeklyDate(weekStart.toISOString(), i),
      income: weekIncome,
      expense: weekExpense
    })
  }
  
  // Generate monthly chart data (Sep - Aug)
  const monthlyData = []
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
    
    monthlyData.push({
      month: formatMonthlyDate(monthStart.toISOString()),
      income: monthIncome,
      expense: monthExpense
    })
  }
  
  return {
    accounts,
    selectedAccount,
    selectedAccountId,
    transactions,
    allTransactions,
    totalIncome,
    totalExpense,
    balance,
    dailyData,
    weeklyData,
    monthlyData,
    dateRange
  }
}