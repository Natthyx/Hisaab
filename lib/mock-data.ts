import { Transaction } from "./types"

// Mock data for UI demonstration
export const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: 5000,
    type: "income",
    reason: "Monthly Salary",
    category: "Salary",
    date: new Date().toISOString(),
  },
  {
    id: "2",
    amount: 1200,
    type: "expense",
    reason: "Rent Payment",
    category: "Bills & Utilities",
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    amount: 450,
    type: "expense",
    reason: "Grocery Shopping",
    category: "Food & Dining",
    date: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "4",
    amount: 800,
    type: "income",
    reason: "Freelance Project",
    category: "Freelance",
    date: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "5",
    amount: 200,
    type: "expense",
    reason: "Uber Rides",
    category: "Transportation",
    date: new Date(Date.now() - 345600000).toISOString(),
  },
]

export const mockChartData = [
  { date: "Mon", income: 1200, expense: 800 },
  { date: "Tue", income: 800, expense: 600 },
  { date: "Wed", income: 1500, expense: 900 },
  { date: "Thu", income: 600, expense: 1100 },
  { date: "Fri", income: 2000, expense: 700 },
  { date: "Sat", income: 400, expense: 1200 },
  { date: "Sun", income: 900, expense: 500 },
]

export const mockMonthlyData = [
  { month: "Jan", income: 15000, expense: 12000 },
  { month: "Feb", income: 18000, expense: 14000 },
  { month: "Mar", income: 16000, expense: 13000 },
  { month: "Apr", income: 20000, expense: 15000 },
  { month: "May", income: 19000, expense: 16000 },
  { month: "Jun", income: 22000, expense: 17000 },
]

export const mockYearlyData = [
  { year: "2020", income: 180000, expense: 150000 },
  { year: "2021", income: 200000, expense: 165000 },
  { year: "2022", income: 220000, expense: 180000 },
  { year: "2023", income: 240000, expense: 195000 },
  { year: "2024", income: 260000, expense: 210000 },
]
