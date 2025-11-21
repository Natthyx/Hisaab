// Analytics service for calculations and business logic (client version)
// This file contains only pure functions that don't require server-side operations

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