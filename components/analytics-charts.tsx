"use client"

import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from "recharts"
import { useTheme } from "next-themes"

// Helper functions for date formatting
const formatDailyDate = (dateString: string) => {
  const date = new Date(dateString)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days[date.getDay()]
}

const formatMonthlyDate = (dateString: string) => {
  const date = new Date(dateString)
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
  return months[date.getMonth()]
}

interface MoneyFlowChartProps {
  data: { day: string; income: number; expense: number; net: number }[]
}

export function MoneyFlowChart({ data }: MoneyFlowChartProps) {
  const { theme } = useTheme()
  
  // Define chart colors based on theme
  const textColor = theme === 'dark' ? '#ffffff' : '#000000'
  const gridColor = theme === 'dark' ? '#444444' : '#e5e7eb'
  
  return (
    <div className="h-90 pl-0 md:pl-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="day" 
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis 
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
          />
          <Tooltip 
            formatter={(value) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Amount']}
            labelFormatter={(label) => `Day: ${label}`}
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              color: textColor
            }}
          />
          <Legend 
            wrapperStyle={{ color: textColor }}
          />
          <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Income" />
          <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expense" />
          <Area type="monotone" dataKey="net" stackId="3" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Net" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface CategoryBreakdownChartProps {
  data: { name: string; value: number; color: string }[]
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const { theme } = useTheme()
  
  // Define chart colors based on theme
  const textColor = theme === 'dark' ? '#ffffff' : '#000000'
  
  return (
    <div className="h-80 p-0 md:p-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Amount']}
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              color: textColor
            }}
          />
          <Legend 
            wrapperStyle={{ color: textColor }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface MonthlyTrendsChartProps {
  data: { month: string; income: number; expense: number }[]
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const { theme } = useTheme()
  
  // Define chart colors based on theme
  const textColor = theme === 'dark' ? '#ffffff' : '#000000'
  const gridColor = theme === 'dark' ? '#444444' : '#e5e7eb'
  
  return (
    <div className="h-80 p-4 md:p-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis 
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
          />
          <Tooltip 
            formatter={(value) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Amount']}
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              color: textColor
            }}
          />
          <Legend 
            wrapperStyle={{ color: textColor }}
          />
          <Bar dataKey="income" fill="#10b981" name="Income" />
          <Bar dataKey="expense" fill="#ef4444" name="Expense" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface BalanceOverTimeChartProps {
  data: { date: string; balance: number }[]
}

export function BalanceOverTimeChart({ data }: BalanceOverTimeChartProps) {
  const { theme } = useTheme()
  
  // Format the data for display
  const formattedData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    balance: item.balance
  }))
  
  // Define chart colors based on theme
  const textColor = theme === 'dark' ? '#ffffff' : '#000000'
  const gridColor = theme === 'dark' ? '#444444' : '#e5e7eb'
  
  return (
    <div className="h-80 p-4 md:p-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis 
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
          />
          <Tooltip 
            formatter={(value) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Balance']}
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              color: textColor
            }}
          />
          <Legend 
            wrapperStyle={{ color: textColor }}
          />
          <Line type="monotone" dataKey="balance" stroke="#3b82f6" activeDot={{ r: 8 }} name="Balance" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}