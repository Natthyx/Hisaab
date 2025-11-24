"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface DateFilterProps {
  currentDateRange?: 'current' | 'previous'
}

export function DateFilter({ currentDateRange = 'current' }: DateFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dateRange, setDateRange] = useState(currentDateRange)
  
  // Update local state when search params change
  useEffect(() => {
    setDateRange(currentDateRange)
  }, [currentDateRange])

  const handleDateRangeChange = (value: string) => {
    setDateRange(value as 'current' | 'previous')
    
    // Create new search params
    const params = new URLSearchParams(searchParams.toString())
    params.set('dateRange', value)
    
    // Preserve account parameter if it exists
    const account = searchParams.get('account')
    if (account) {
      params.set('account', account)
    } else {
      params.delete('account')
    }
    
    // Navigate to the new URL
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">View:</span>
      <Select value={dateRange} onValueChange={handleDateRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current">Current Week</SelectItem>
          <SelectItem value="previous">Previous Week</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}