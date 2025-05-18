"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ComplaintChartProps {
  period: string
}

export default function ComplaintChart({ period }: ComplaintChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/charts/complaints?period=${period}`)

        if (!response.ok) {
          throw new Error("Failed to fetch chart data")
        }

        const chartData = await response.json()
        setData(chartData)
      } catch (error) {
        console.error("Error fetching chart data:", error)
        // Fallback to mock data
        generateMockData()
      } finally {
        setLoading(false)
      }
    }

    const generateMockData = () => {
      if (period === "week") {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        const weekData = days.map((day) => ({
          name: day,
          total: Math.floor(Math.random() * 50) + 10,
          resolved: Math.floor(Math.random() * 30) + 5,
        }))
        setData(weekData)
      } else if (period === "month") {
        const monthData = Array.from({ length: 30 }, (_, i) => ({
          name: `${i + 1}`,
          total: Math.floor(Math.random() * 50) + 10,
          resolved: Math.floor(Math.random() * 30) + 5,
        }))
        setData(monthData)
      } else if (period === "year") {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const yearData = months.map((month) => ({
          name: month,
          total: Math.floor(Math.random() * 500) + 100,
          resolved: Math.floor(Math.random() * 300) + 50,
        }))
        setData(yearData)
      }
    }

    fetchChartData()
  }, [period])

  if (loading || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#0369a1"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name="Total Complaints"
          />
          <Line
            type="monotone"
            dataKey="resolved"
            stroke="#16a34a"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name="Resolved"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
