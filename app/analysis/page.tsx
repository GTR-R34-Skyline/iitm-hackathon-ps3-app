"use client"

import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { CSVUpload } from "@/components/csv-upload"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface AnalysisResult {
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
}

export default function AnalysisRoute() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  // DEBUG: Watch for state changes
  console.log("📊 Current analysisResult state:", analysisResult)

  const handleAnalysisComplete = (result: AnalysisResult) => {
    console.log("1️⃣ Analysis complete callback fired", result)
    console.log("2️⃣ About to call setAnalysisResult with:", result)
    setAnalysisResult(result)
    console.log("3️⃣ setAnalysisResult called")
  }
  if (analysisResult) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 max-w-7xl mx-auto border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Data Quality Analysis</h1>
            <button
              onClick={() => setAnalysisResult(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Upload Different File
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase mb-2">Composite Score</p>
                <p className="text-3xl font-bold">{analysisResult.DQS}</p>
                <p className="text-xs text-muted-foreground mt-1">/ 100</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase mb-2">Completeness</p>
                <p className="text-3xl font-bold">{Math.round(analysisResult.dimensions.completeness * 100)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase mb-2">Consistency</p>
                <p className="text-3xl font-bold">{Math.round(analysisResult.dimensions.consistency * 100)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase mb-2">Validity</p>
                <p className="text-3xl font-bold">{Math.round(analysisResult.dimensions.validity * 100)}</p>
              </CardContent>
            </Card>
          </div>

          {analysisResult.metadata && (
            <div className="text-sm text-muted-foreground mb-4">
              <p>📊 {analysisResult.metadata.rowCount} rows | 📋 {analysisResult.metadata.columnCount} columns</p>
              <p>Columns: {analysisResult.metadata.columns.join(", ")}</p>
            </div>
          )}
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          <AnalyticsDashboard 
            dimensions={analysisResult.dimensions}
            DQS={analysisResult.DQS}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold">Data Quality Analysis</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to analyze your data quality dimensions powered by Gemini AI.
          </p>
        </div>
        <CSVUpload onAnalysisComplete={handleAnalysisComplete} />
      </div>
    </div>
  )
}