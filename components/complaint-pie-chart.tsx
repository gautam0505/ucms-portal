"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

export default function ComplaintPieChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/charts/categories")

        if (!response.ok) {
          throw new Error("Failed to fetch category data")
        }

        const categoryData = await response.json()
        setData(categoryData)
      } catch (error) {
        console.error("Error fetching category data:", error)
        // Fallback to mock data
        const mockData = [
          { name: "Roads", value: 35 },
          { name: "Water", value: 25 },
          { name: "Sanitation", value: 20 },
          { name: "Electricity", value: 15 },
          { name: "Others", value: 5 },
        ]
        setData(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} complaints`, "Count"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
