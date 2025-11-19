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
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
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
