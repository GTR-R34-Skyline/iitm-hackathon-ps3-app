"use client"

import { useState } from "react"
import { CSVUpload } from "./csv-upload"
import { AnalysisResults } from "./analysis-results"
import { ExplanationPanel } from "./explanation-panel"
import { AnalyticsDashboard } from "./analytics-dashboard"

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

interface ExplanationResult {
  explanation: string
  recommendations: Array<{
    severity: "High" | "Medium" | "Low"
    text: string
    impact: "Compliance" | "Operations" | "Analytics"
  }>
}

export function AnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null)
  const [explaining, setExplaining] = useState(false)
  const [explainError, setExplainError] = useState<string | null>(null)

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result)
    setExplanation(null) // Clear previous explanation
    setExplainError(null)
  }

  const handleExplain = async () => {
    if (!analysisResult) return

    setExplaining(true)
    setExplainError(null)

    try {
      const { API_ENDPOINTS } = await import("@/lib/api-config")
      const response = await fetch(API_ENDPOINTS.explain, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dimensions: analysisResult.dimensions,
          DQS: analysisResult.DQS,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Server error: ${response.statusText}`)
      }

      const result = await response.json()
      setExplanation(result)
    } catch (err) {
      setExplainError(err instanceof Error ? err.message : "Failed to generate explanation")
      console.error("Explanation error:", err)
    } finally {
      setExplaining(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Quality Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Upload a CSV file to analyze data quality and get AI-powered insights
          </p>
        </div>

        {/* CSV Upload */}
        <CSVUpload onAnalysisComplete={handleAnalysisComplete} />

        {/* Analytics Dashboard */}
        {analysisResult && (
          <AnalyticsDashboard
            dimensions={analysisResult.dimensions}
            DQS={analysisResult.DQS}
          />
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <AnalysisResults
            dimensions={analysisResult.dimensions}
            DQS={analysisResult.DQS}
            metadata={analysisResult.metadata}
            onExplain={handleExplain}
            explaining={explaining}
          />
        )}

        {/* Explanation Panel */}
        {analysisResult && (
          <ExplanationPanel
            explanation={explanation?.explanation || ""}
            recommendations={explanation?.recommendations || []}
            loading={explaining}
            error={explainError}
          />
        )}
      </div>
    </div>
  )
}

