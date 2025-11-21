// Shared types for the application

export interface Account {
  id: string
  name: string
  initial_balance: number
  created_at: string
  user_id: string
}

export interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  reason: string
  category: string
  date: string
  account_id: string
  user_id: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  default_account_id?: string
}