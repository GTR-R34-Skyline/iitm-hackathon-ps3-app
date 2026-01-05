"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts"

interface AnalyticsDashboardProps {
  dimensions: {
    completeness: number
    uniqueness: number
    consistency: number
    validity: number
    timeliness?: number
  }
  DQS: number
  trendData?: Array<{ date: string; score: number }>
}

export function AnalyticsDashboard({ dimensions, DQS, trendData }: AnalyticsDashboardProps) {
  // GUARD: Prevents "Cannot read properties of undefined" error
  if (!dimensions) {
    return (
      <div className="flex items-center justify-center p-12 border rounded-lg bg-muted/10 h-[300px] w-full col-span-2">
        <p className="text-muted-foreground animate-pulse">Initializing dashboard charts...</p>
      </div>
    );
  }

  // Prepare data for bar chart with safety fallbacks
  const dimensionData = [
    { name: "Completeness", score: dimensions.completeness || 0 },
    { name: "Uniqueness", score: dimensions.uniqueness || 0 },
    { name: "Consistency", score: dimensions.consistency || 0 },
    { name: "Validity", score: dimensions.validity || 0 },
    ...(dimensions.timeliness !== undefined
      ? [{ name: "Timeliness", score: dimensions.timeliness }]
      : []),
  ]

  // Default trend data if not provided
  const defaultTrend = trendData || [
    { date: "Week 1", score: Math.max(0, DQS - 5) },
    { date: "Week 2", score: Math.max(0, DQS - 3) },
    { date: "Week 3", score: Math.max(0, DQS - 1) },
    { date: "Current", score: DQS },
  ]

  const getBarColor = (score: number) => {
    if (score >= 80) return "#10b981" 
    if (score >= 60) return "#f59e0b" 
    return "#ef4444" 
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dimension Scores</CardTitle>
          <CardDescription>Data quality metrics by dimension</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dimensionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "#ffffff" }}
              />
              <YAxis 
                domain={[0, 100]} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "#ffffff" }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "#1f2937", 
                  border: "1px solid #374151", 
                  borderRadius: "8px",
                  color: "#ffffff"
                }}
                labelStyle={{ color: "#ffffff", fontWeight: 600 }}
                cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {dimensionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trend Over Time</CardTitle>
          <CardDescription>Data quality score progression</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={defaultTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "#ffffff" }}
              />
              <YAxis 
                domain={[0, 100]} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "#ffffff" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#1f2937", 
                  border: "1px solid #374151", 
                  borderRadius: "8px",
                  color: "#ffffff"
                }}
                labelStyle={{ color: "#ffffff", fontWeight: 600 }}
                cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}