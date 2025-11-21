import { useState, useEffect } from "react"
import { 
  calculateSavingsRate,
  findBiggestExpenseCategory,
  detectRecurringExpenses,
  calculateRunningBalance,
  getTopDays,
  generateDailyData,
  generateCategoryData,
  generateMonthlyTrendData
} from "@/lib/analytics/client-service"

export function useAnalytics(transactions: any[], initialBalance: number) {
  const [analyticsData, setAnalyticsData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    savingsRate: 0,
    biggestExpense: { category: '', amount: 0 },
    dailyData: [] as any[],
    categoryData: [] as any[],
    recurringExpenses: [] as any[],
    runningBalanceData: [] as any[],
    topSpendingDays: [] as any[],
    topEarningDays: [] as any[],
    monthlyTrendData: [] as any[]
  })

  useEffect(() => {
    // Calculate summary metrics
    let totalIncome = 0
    let totalExpense = 0
    
    transactions?.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount
      } else {
        totalExpense += transaction.amount
      }
    })
    
    const netBalance = initialBalance + totalIncome - totalExpense
    const savingsRate = calculateSavingsRate(totalIncome, totalExpense)
    const biggestExpense = findBiggestExpenseCategory(transactions || [])
    
    // Generate chart data
    const dailyData = generateDailyData(transactions || [])
    const categoryData = generateCategoryData(transactions || [])
    const recurringExpenses = detectRecurringExpenses(transactions || [])
    const runningBalanceData = calculateRunningBalance(initialBalance, transactions || [])
    const topSpendingDays = getTopDays(transactions || [], 'expense')
    const topEarningDays = getTopDays(transactions || [], 'income')
    const monthlyTrendData = generateMonthlyTrendData(transactions || [])
    
    setAnalyticsData({
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      biggestExpense,
      dailyData,
      categoryData,
      recurringExpenses,
      runningBalanceData,
      topSpendingDays,
      topEarningDays,
      monthlyTrendData
    })
  }, [transactions, initialBalance])

  return analyticsData
}