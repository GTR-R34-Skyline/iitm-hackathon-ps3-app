"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalysisResultsProps {
  dimensions: {
    completeness: number
    uniqueness: number
    consistency: number
    validity: number
    timeliness?: number
  }
  DQS: number
  metadata?: {
    rowCount: number
    columnCount: number
    columns: string[]
  }
  onExplain: () => void
  explaining: boolean
}

export function AnalysisResults({
  dimensions,
  DQS,
  metadata,
  onExplain,
  explaining,
}: AnalysisResultsProps) {
if (!dimensions) return null;
  const dimensionList = [
    { name: "Completeness", score: dimensions.completeness },
    { name: "Uniqueness", score: dimensions.uniqueness },
    { name: "Consistency", score: dimensions.consistency },
    { name: "Validity", score: dimensions.validity },
    ...(dimensions.timeliness !== undefined
      ? [{ name: "Timeliness", score: dimensions.timeliness }]
      : []),
  ]

  const getStatus = (score: number): "Good" | "Moderate" | "Poor" => {
    if (score >= 80) return "Good"
    if (score >= 60) return "Moderate"
    return "Poor"
  }

  const getStatusColor = (status: "Good" | "Moderate" | "Poor") => {
    switch (status) {
      case "Good":
        return "bg-emerald-500"
      case "Moderate":
        return "bg-amber-500"
      case "Poor":
        return "bg-destructive"
    }
  }

  return (
    <div className="space-y-6">
      {/* Big DQS Number */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Score (DQS)</CardTitle>
          <CardDescription>Overall composite score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-7xl font-bold tracking-tight">{DQS}</div>
              <div className="text-sm text-muted-foreground mt-2">out of 100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Dimension Scores</CardTitle>
          <CardDescription>Individual quality metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dimensionList.map((dim) => {
              const status = getStatus(dim.score)
              return (
                <div key={dim.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dim.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{dim.score}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          status === "Good"
                            ? "border-emerald-500 text-emerald-500"
                            : status === "Moderate"
                              ? "border-amber-500 text-amber-500"
                              : "border-destructive text-destructive"
                        )}
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all", getStatusColor(status))}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      {metadata && (
        <Card>
          <CardHeader>
            <CardTitle>Dataset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rows:</span>
              <span className="font-medium">{metadata.rowCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Columns:</span>
              <span className="font-medium">{metadata.columnCount}</span>
            </div>
            {metadata.columns && metadata.columns.length > 0 && (
              <div>
                <span className="text-muted-foreground">Field names:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {metadata.columns.slice(0, 10).map((col) => (
                    <Badge key={col} variant="secondary" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                  {metadata.columns.length > 10 && (
                    <Badge variant="secondary" className="text-xs">
                      +{metadata.columns.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Explain Button */}
      <Button onClick={onExplain} disabled={explaining} className="w-full" size="lg">
        <Sparkles className="h-4 w-4 mr-2" />
        {explaining ? "Generating Explanation..." : "Get AI Explanation"}
      </Button>
    </div>
  )
}


