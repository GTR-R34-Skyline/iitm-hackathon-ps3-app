/**
 * Type definitions for the Data Quality Scoring backend
 */

export interface DimensionScores {
  completeness: number
  uniqueness: number
  consistency: number
  validity: number
  timeliness?: number
}

export interface AnalysisResult {
  dimensions: DimensionScores
  DQS: number
  metadata?: {
    rowCount: number
    columnCount: number
    columns: string[]
  }
}

export interface ExplanationRequest {
  dimensions: DimensionScores
  DQS: number
}

export interface Insight {
  title: string
  text: string
}

export interface Recommendation {
  severity: "High" | "Medium" | "Low"
  text: string
  impact: "Compliance" | "Operations" | "Analytics"
}

export interface ExplanationResponse {
  explanation: string
  recommendations: Recommendation[]
}

export interface ErrorResponse {
  error: string
  message?: string
}

