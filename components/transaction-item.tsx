import { Transaction } from "@/lib/types"
import { ArrowUpIcon, ArrowDownIcon, Trash2Icon, Edit2Icon } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface TransactionItemProps {
  transaction: Transaction
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income"
  const date = new Date(transaction.date)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {isIncome ? (
            <ArrowUpIcon className="h-5 w-5" />
          ) : (
            <ArrowDownIcon className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="font-medium">{transaction.reason}</p>
          <p className="text-sm text-muted-foreground">
            {transaction.category} • {formattedDate}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p
          className={`text-lg font-semibold ${
            isIncome ? "text-green-600" : "text-red-600"
          }`}
        >
          {isIncome ? "+" : "-"}${transaction.amount.toLocaleString()}
        </p>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(transaction.id)}
            >
              <Edit2Icon className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(transaction.id)}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
