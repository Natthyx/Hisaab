import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface BalanceCardProps {
  balance: number
  income: number
  expense: number
}

export function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  return (
    <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-0">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-indigo-100">
          Current Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-4xl font-bold">${balance.toLocaleString()}</div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
              <ArrowUpIcon className="h-4 w-4 text-green-300" />
            </div>
            <div>
              <p className="text-xs text-indigo-100">Income</p>
              <p className="text-sm font-semibold">${income.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
              <ArrowDownIcon className="h-4 w-4 text-red-300" />
            </div>
            <div>
              <p className="text-xs text-indigo-100">Expense</p>
              <p className="text-sm font-semibold">${expense.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
