export type TransactionType = "income" | "expense"

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  reason: string
  category: string
  date: string
}

export interface User {
  id: string
  initialBalance: number
}

export interface AnalyticsPeriod {
  income: number
  expense: number
  balance: number
  transactions: Transaction[]
}

export const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Other",
] as const

export type Category = typeof categories[number]
