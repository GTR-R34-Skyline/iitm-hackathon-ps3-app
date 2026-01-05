/**
 * Deterministic Data Quality Scoring Engine
 * 
 * All scoring logic is deterministic and explainable.
 * GenAI is NOT used for scoring - only for explanations.
 */

import { DimensionScores } from "./types"

export interface CSVRow {
  [key: string]: string
}

export interface ScoringMetadata {
  // Metadata-only: no raw data stored
  columns: string[]
  rowCount: number
  columnCount: number
  hasDateColumn: boolean
  dateColumnName?: string
}

/**
 * Calculate completeness score
 * Percentage of non-empty values across all fields
 */
function calculateCompleteness(rows: CSVRow[], columns: string[]): number {
  if (rows.length === 0 || columns.length === 0) {
    return 0
  }

  let totalCells = 0
  let nonEmptyCells = 0

  for (const row of rows) {
    for (const col of columns) {
      totalCells++
      const value = row[col]
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        nonEmptyCells++
      }
    }
  }

  if (totalCells === 0) return 0
  return Math.round((nonEmptyCells / totalCells) * 100)
}

/**
 * Calculate uniqueness score
 * Percentage of unique values per column, averaged
 */
function calculateUniqueness(rows: CSVRow[], columns: string[]): number {
  if (rows.length === 0 || columns.length === 0) {
    return 0
  }

  let totalUniqueness = 0
  let columnCount = 0

  for (const col of columns) {
    const values = rows.map((row) => String(row[col] || "").trim()).filter((v) => v !== "")
    const uniqueValues = new Set(values)
    const uniqueness = values.length > 0 ? (uniqueValues.size / values.length) * 100 : 100
    totalUniqueness += uniqueness
    columnCount++
  }

  if (columnCount === 0) return 0
  return Math.round(totalUniqueness / columnCount)
}

/**
 * Calculate consistency score
 * Measures format consistency across rows (simplified: checks for consistent non-empty patterns)
 */
function calculateConsistency(rows: CSVRow[], columns: string[]): number {
  if (rows.length === 0 || columns.length === 0) {
    return 0
  }

  // Simplified consistency: check if columns have consistent patterns
  // Real implementation would check formats (dates, emails, etc.)
  let totalConsistency = 0
  let columnCount = 0

  for (const col of columns) {
    const values = rows.map((row) => String(row[col] || "").trim()).filter((v) => v !== "")
    
    if (values.length === 0) {
      totalConsistency += 100 // Empty column is "consistent"
      columnCount++
      continue
    }

    // Check length consistency (simplified metric)
    const lengths = values.map((v) => v.length)
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((sum, len) => sum + Math.abs(len - avgLength), 0) / lengths.length
    const consistency = Math.max(0, 100 - (variance / Math.max(avgLength, 1)) * 100)
    
    totalConsistency += consistency
    columnCount++
  }

  if (columnCount === 0) return 0
  return Math.round(totalConsistency / columnCount)
}

/**
 * Calculate validity score
 * Percentage of rows that pass basic validation (non-empty key columns)
 */
function calculateValidity(rows: CSVRow[], columns: string[]): number {
  if (rows.length === 0) {
    return 0
  }

  if (columns.length === 0) {
    return 0
  }

  // Simplified validity: check if first column (usually ID/key) has valid values
  const keyColumn = columns[0]
  const validRows = rows.filter((row) => {
    const value = String(row[keyColumn] || "").trim()
    return value !== ""
  })

  return Math.round((validRows.length / rows.length) * 100)
}

/**
 * Calculate timeliness score
 * Based on date column freshness (if available)
 */
function calculateTimeliness(rows: CSVRow[], dateColumnName: string): number {
  if (rows.length === 0) {
    return 0
  }

  const now = new Date()
  let validDates = 0
  let totalAgeHours = 0

  for (const row of rows) {
    const dateValue = String(row[dateColumnName] || "").trim()
    if (dateValue === "") continue

    try {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        const ageMs = now.getTime() - date.getTime()
        const ageHours = ageMs / (1000 * 60 * 60)
        totalAgeHours += ageHours
        validDates++
      }
    } catch {
      // Invalid date, skip
    }
  }

  if (validDates === 0) {
    return 50 // No valid dates, return neutral score
  }

  const avgAgeHours = totalAgeHours / validDates

  // Score decreases with age:
  // < 1 hour: 100
  // < 6 hours: 95
  // < 24 hours: 85
  // < 72 hours: 70
  // < 168 hours (1 week): 50
  // >= 168 hours: 30

  if (avgAgeHours < 1) return 100
  if (avgAgeHours < 6) return 95
  if (avgAgeHours < 24) return 85
  if (avgAgeHours < 72) return 70
  if (avgAgeHours < 168) return 50
  return 30
}

/**
 * Detect if a column contains dates
 */
function detectDateColumn(rows: CSVRow[], columns: string[]): { found: boolean; columnName?: string } {
  if (rows.length === 0) {
    return { found: false }
  }

  // Check common date column names first
  const dateKeywords = ["date", "time", "timestamp", "created", "updated", "modified"]
  for (const col of columns) {
    const lowerCol = col.toLowerCase()
    if (dateKeywords.some((keyword) => lowerCol.includes(keyword))) {
      // Verify it contains date-like values
      const sampleValues = rows.slice(0, Math.min(10, rows.length)).map((r) => String(r[col] || "").trim())
      const dateLikeCount = sampleValues.filter((v) => {
        if (v === "") return false
        const date = new Date(v)
        return !isNaN(date.getTime())
      }).length

      if (dateLikeCount > sampleValues.length * 0.5) {
        return { found: true, columnName: col }
      }
    }
  }

  return { found: false }
}

/**
 * Compute data quality scores from CSV data
 * @param rows - CSV row data (used for computation only, not stored)
 * @param metadata - Metadata about the dataset (no raw data)
 */
export function computeScores(rows: CSVRow[], metadata: ScoringMetadata): DimensionScores {
  const { columns, hasDateColumn, dateColumnName } = metadata

  const scores: DimensionScores = {
    completeness: calculateCompleteness(rows, columns),
    uniqueness: calculateUniqueness(rows, columns),
    consistency: calculateConsistency(rows, columns),
    validity: calculateValidity(rows, columns),
  }

  // Add timeliness if date column exists
  if (hasDateColumn && dateColumnName) {
    scores.timeliness = calculateTimeliness(rows, dateColumnName)
  }

  return scores
}

/**
 * Calculate Data Quality Score (DQS)
 * Average of all dimension scores
 */
export function calculateDQS(scores: DimensionScores): number {
  const dimensions = [
    scores.completeness,
    scores.uniqueness,
    scores.consistency,
    scores.validity,
    scores.timeliness,
  ].filter((score) => score !== undefined) as number[]

  if (dimensions.length === 0) {
    return 0
  }

  const sum = dimensions.reduce((a, b) => a + b, 0)
  return Math.round(sum / dimensions.length)
}

/**
 * Prepare scoring metadata from parsed CSV (metadata-only, no raw data)
 * This function extracts only structural information, not the actual data values.
 */
export function prepareMetadata(rows: CSVRow[]): ScoringMetadata {
  if (rows.length === 0) {
    return {
      columns: [],
      rowCount: 0,
      columnCount: 0,
      hasDateColumn: false,
    }
  }

  const columns = Object.keys(rows[0])
  const dateInfo = detectDateColumn(rows, columns)

  return {
    columns,
    rowCount: rows.length,
    columnCount: columns.length,
    hasDateColumn: dateInfo.found,
    dateColumnName: dateInfo.columnName,
  }
}

