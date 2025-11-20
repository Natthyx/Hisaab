"use client"

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"

interface ChartData {
  [key: string]: string | number
}

interface ExpenseChartProps {
  data: ChartData[]
  title?: string
  type?: "line" | "bar"
  dataKeys: { key: string; color: string; label: string }[]
  xAxisKey: string
}

export function ExpenseChart({
  data,
  title,
  type = "line",
  dataKeys,
  xAxisKey,
}: ExpenseChartProps) {
  const { theme } = useTheme()
  
  // Define chart colors based on theme
  const textColor = theme === 'dark' ? '#ffffff' : '#000000'
  const gridColor = theme === 'dark' ? '#444444' : '#e5e7eb'
  
  const ChartComponent = type === "line" ? LineChart : BarChart
  const DataComponent = type === "line" ? Line : Bar

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs"
              tick={{ fill: textColor }}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: textColor }}
              axisLine={{ stroke: gridColor }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                borderRadius: "var(--radius)",
                color: textColor
              }}
            />
            <Legend 
              wrapperStyle={{ color: textColor }}
            />
            {dataKeys.map((item) => (
              <DataComponent
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                fill={item.color}
                name={item.label}
                strokeWidth={2}
              />
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}