"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Recommendation {
  severity: "High" | "Medium" | "Low"
  text: string
  impact: "Compliance" | "Operations" | "Analytics"
}

interface ExplanationPanelProps {
  explanation: string
  recommendations: Recommendation[]
  loading?: boolean
  error?: string | null
}

export function ExplanationPanel({ explanation, recommendations, loading, error }: ExplanationPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Explanation</CardTitle>
          <CardDescription>Generating insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading explanation...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const getSeverityIcon = (severity: "High" | "Medium" | "Low") => {
    switch (severity) {
      case "High":
        return <AlertTriangle className="h-4 w-4" />
      case "Medium":
        return <AlertCircle className="h-4 w-4" />
      case "Low":
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: "High" | "Medium" | "Low") => {
    switch (severity) {
      case "High":
        return "border-destructive/50 text-destructive bg-destructive/10"
      case "Medium":
        return "border-amber-500/50 text-amber-500 bg-amber-500/10"
      case "Low":
        return "border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
    }
  }

  const getImpactColor = (impact: "Compliance" | "Operations" | "Analytics") => {
    switch (impact) {
      case "Compliance":
        return "bg-red-100 text-red-800 border-red-200"
      case "Operations":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Analytics":
        return "bg-purple-100 text-purple-800 border-purple-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          AI Explanation
        </CardTitle>
        <CardDescription>GenAI-powered insights and recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg border space-y-2",
                  getSeverityColor(rec.severity)
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(rec.severity)}
                    <Badge
                      variant="outline"
                      className={cn("text-xs uppercase", getSeverityColor(rec.severity))}
                    >
                      {rec.severity}
                    </Badge>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", getImpactColor(rec.impact))}>
                    {rec.impact}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed">{rec.text}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

