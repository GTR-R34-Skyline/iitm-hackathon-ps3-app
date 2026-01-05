/**
 * Reusable Data Quality Scoring Functions
 * 
 * Simple, rule-based scoring functions for data quality dimensions.
 * All functions return scores between 0-100.
 * Edge cases return valid scores (with warnings in console) instead of failures.
 */

/**
 * Compute completeness score
 * 
 * Calculates the percentage of non-empty values across all rows and columns.
 * Empty values include: null, undefined, empty strings, whitespace-only strings.
 * 
 * @param {Array<Object>} rows - Array of row objects (e.g., [{col1: 'val1', col2: 'val2'}, ...])
 * @returns {number} Completeness score (0-100)
 */
function computeCompleteness(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('computeCompleteness: Empty or invalid rows array')
    return 0
  }

  let totalCells = 0
  let nonEmptyCells = 0

  // Get all column names from first row
  const columns = Object.keys(rows[0] || {})
  if (columns.length === 0) {
    console.warn('computeCompleteness: No columns found in rows')
    return 0
  }

  // Count non-empty cells
  for (const row of rows) {
    for (const col of columns) {
      totalCells++
      const value = row[col]
      
      // Check if value is non-empty
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        nonEmptyCells++
      }
    }
  }

  if (totalCells === 0) {
    console.warn('computeCompleteness: No cells to evaluate')
    return 0
  }

  // Calculate percentage
  const score = Math.round((nonEmptyCells / totalCells) * 100)
  return Math.max(0, Math.min(100, score)) // Ensure 0-100 range
}

/**
 * Compute uniqueness score
 * 
 * Calculates the average uniqueness across all columns.
 * For each column: uniqueness = (unique values / total values) * 100
 * Final score is the average of all column uniqueness scores.
 * 
 * @param {Array<Object>} rows - Array of row objects
 * @returns {number} Uniqueness score (0-100)
 */
function computeUniqueness(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('computeUniqueness: Empty or invalid rows array')
    return 0
  }

  const columns = Object.keys(rows[0] || {})
  if (columns.length === 0) {
    console.warn('computeUniqueness: No columns found in rows')
    return 0
  }

  let totalUniqueness = 0
  let columnCount = 0

  for (const col of columns) {
    // Get all non-empty values for this column
    const values = rows
      .map(row => String(row[col] || '').trim())
      .filter(val => val !== '')

    if (values.length === 0) {
      // Empty column: consider it 100% unique (no duplicates possible)
      totalUniqueness += 100
      columnCount++
      continue
    }

    // Count unique values
    const uniqueValues = new Set(values)
    const uniqueness = (uniqueValues.size / values.length) * 100
    totalUniqueness += uniqueness
    columnCount++
  }

  if (columnCount === 0) {
    console.warn('computeUniqueness: No columns to evaluate')
    return 0
  }

  // Average uniqueness across all columns
  const score = Math.round(totalUniqueness / columnCount)
  return Math.max(0, Math.min(100, score))
}

/**
 * Compute consistency score
 * 
 * Measures format consistency across rows for each column.
 * Uses length variance as a simple consistency metric:
 * - Lower variance = higher consistency
 * - Checks if values in a column have similar lengths/patterns
 * 
 * @param {Array<Object>} rows - Array of row objects
 * @returns {number} Consistency score (0-100)
 */
function computeConsistency(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('computeConsistency: Empty or invalid rows array')
    return 0
  }

  const columns = Object.keys(rows[0] || {})
  if (columns.length === 0) {
    console.warn('computeConsistency: No columns found in rows')
    return 0
  }

  let totalConsistency = 0
  let columnCount = 0

  for (const col of columns) {
    const values = rows
      .map(row => String(row[col] || '').trim())
      .filter(val => val !== '')

    if (values.length === 0) {
      // Empty column: consider it 100% consistent (no inconsistencies possible)
      totalConsistency += 100
      columnCount++
      continue
    }

    if (values.length === 1) {
      // Single value: 100% consistent
      totalConsistency += 100
      columnCount++
      continue
    }

    // Calculate length variance (simplified consistency metric)
    const lengths = values.map(val => val.length)
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length
    
    // Calculate average deviation from mean length
    const deviations = lengths.map(len => Math.abs(len - avgLength))
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length
    
    // Convert to score: lower deviation = higher score
    // Normalize: if avgLength is 0, use deviation directly; otherwise use ratio
    const maxDeviation = Math.max(avgLength, 1)
    const consistency = Math.max(0, 100 - (avgDeviation / maxDeviation) * 100)
    
    totalConsistency += consistency
    columnCount++
  }

  if (columnCount === 0) {
    console.warn('computeConsistency: No columns to evaluate')
    return 0
  }

  const score = Math.round(totalConsistency / columnCount)
  return Math.max(0, Math.min(100, score))
}

/**
 * Compute validity score
 * 
 * Measures the percentage of rows that have valid key fields.
 * Uses the first column as the key field (typically ID/identifier).
 * A row is valid if the key field is non-empty.
 * 
 * @param {Array<Object>} rows - Array of row objects
 * @returns {number} Validity score (0-100)
 */
function computeValidity(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('computeValidity: Empty or invalid rows array')
    return 0
  }

  const columns = Object.keys(rows[0] || {})
  if (columns.length === 0) {
    console.warn('computeValidity: No columns found in rows')
    return 0
  }

  // Use first column as key field (typically ID/identifier)
  const keyColumn = columns[0]

  // Count rows with valid key fields
  const validRows = rows.filter(row => {
    const value = row[keyColumn]
    return value !== null && value !== undefined && String(value).trim() !== ''
  })

  // Calculate percentage of valid rows
  const score = Math.round((validRows.length / rows.length) * 100)
  return Math.max(0, Math.min(100, score))
}

/**
 * Compute timeliness score
 * 
 * Measures data freshness based on date values in rows.
 * Automatically detects date columns by checking common date column names.
 * Scores decrease as data age increases:
 * - < 1 hour: 100
 * - < 6 hours: 95
 * - < 24 hours: 85
 * - < 72 hours: 70
 * - < 168 hours (1 week): 50
 * - >= 168 hours: 30
 * 
 * If no date column is found, returns 50 (neutral score).
 * 
 * @param {Array<Object>} rows - Array of row objects
 * @returns {number} Timeliness score (0-100)
 */
function computeTimeliness(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('computeTimeliness: Empty or invalid rows array, returning neutral score')
    return 50
  }

  const columns = Object.keys(rows[0] || {})
  if (columns.length === 0) {
    console.warn('computeTimeliness: No columns found, returning neutral score')
    return 50
  }

  // Common date column names
  const dateKeywords = ['date', 'time', 'timestamp', 'created', 'updated', 'modified']
  
  // Find date column
  let dateColumn = null
  for (const col of columns) {
    const lowerCol = col.toLowerCase()
    if (dateKeywords.some(keyword => lowerCol.includes(keyword))) {
      dateColumn = col
      break
    }
  }

  if (!dateColumn) {
    console.warn('computeTimeliness: No date column detected, returning neutral score')
    return 50
  }

  const now = new Date()
  let validDates = 0
  let totalAgeHours = 0

  // Calculate average age of dates
  for (const row of rows) {
    const dateValue = String(row[dateColumn] || '').trim()
    if (dateValue === '') continue

    try {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        const ageMs = now.getTime() - date.getTime()
        const ageHours = ageMs / (1000 * 60 * 60)
        totalAgeHours += ageHours
        validDates++
      }
    } catch (error) {
      // Invalid date, skip
      continue
    }
  }

  if (validDates === 0) {
    console.warn('computeTimeliness: No valid dates found, returning neutral score')
    return 50
  }

  // Calculate average age
  const avgAgeHours = totalAgeHours / validDates

  // Score based on age thresholds
  if (avgAgeHours < 1) return 100
  if (avgAgeHours < 6) return 95
  if (avgAgeHours < 24) return 85
  if (avgAgeHours < 72) return 70
  if (avgAgeHours < 168) return 50
  return 30
}

/**
 * Compute all data quality scores
 * 
 * Main function that computes all dimension scores and returns them as an object.
 * 
 * @param {Array<Object>} rows - Array of row objects
 * @returns {Object} Object containing all dimension scores
 * @returns {number} returns.completeness - Completeness score (0-100)
 * @returns {number} returns.uniqueness - Uniqueness score (0-100)
 * @returns {number} returns.consistency - Consistency score (0-100)
 * @returns {number} returns.validity - Validity score (0-100)
 * @returns {number} returns.timeliness - Timeliness score (0-100)
 */
function computeAllScores(rows) {
  return {
    completeness: computeCompleteness(rows),
    uniqueness: computeUniqueness(rows),
    consistency: computeConsistency(rows),
    validity: computeValidity(rows),
    timeliness: computeTimeliness(rows),
  }
}

/**
 * Default weights for composite DQS calculation
 * 
 * Weights are designed to reflect the relative importance of each dimension
 * in payment domain data quality:
 * 
 * - Completeness (0.25): Critical for compliance - missing data can lead to
 *   regulatory issues and failed transactions
 * 
 * - Uniqueness (0.20): Important for data integrity - duplicates cause
 *   reconciliation issues and analytics errors
 * 
 * - Consistency (0.15): Impacts operational efficiency - inconsistent formats
 *   require manual cleanup and cause integration problems
 * 
 * - Validity (0.25): Essential for compliance - invalid data violates business
 *   rules and can cause transaction failures
 * 
 * - Timeliness (0.15): Relevant for real-time operations - stale data affects
 *   decision-making but is less critical than data correctness
 * 
 * Total weight = 1.0 (100%)
 */
const DEFAULT_WEIGHTS = {
  completeness: 0.25,
  uniqueness: 0.20,
  consistency: 0.15,
  validity: 0.25,
  timeliness: 0.15,
}

/**
 * Compute composite Data Quality Score (DQS) using weighted average
 * 
 * Combines individual dimension scores into a single composite score using
 * configurable weights. The weighted average ensures that more critical
 * dimensions (like completeness and validity) have greater influence on
 * the overall score.
 * 
 * Formula: DQS = Σ(score_i × weight_i) / Σ(weight_i)
 * 
 * @param {Object} dimensions - Object containing dimension scores
 * @param {number} dimensions.completeness - Completeness score (0-100)
 * @param {number} dimensions.uniqueness - Uniqueness score (0-100)
 * @param {number} dimensions.consistency - Consistency score (0-100)
 * @param {number} dimensions.validity - Validity score (0-100)
 * @param {number} [dimensions.timeliness] - Timeliness score (0-100, optional)
 * @param {Object} [weights=DEFAULT_WEIGHTS] - Optional weights object
 * @returns {Object} Object containing dimensions and composite DQS
 * @returns {Object} returns.dimensions - Original dimension scores
 * @returns {number} returns.DQS - Composite Data Quality Score (0-100, rounded integer)
 */
function computeDQS(dimensions, weights = DEFAULT_WEIGHTS) {
  // Validate dimensions object
  if (!dimensions || typeof dimensions !== 'object') {
    console.warn('computeDQS: Invalid dimensions object, returning 0')
    return { dimensions: {}, DQS: 0 }
  }

  // Validate required dimensions
  const required = ['completeness', 'uniqueness', 'consistency', 'validity']
  for (const key of required) {
    if (typeof dimensions[key] !== 'number' || dimensions[key] < 0 || dimensions[key] > 100) {
      console.warn(`computeDQS: Invalid ${key} score, using 0`)
      dimensions[key] = 0
    }
  }

  // Handle timeliness (optional dimension)
  const hasTimeliness = typeof dimensions.timeliness === 'number' &&
                        dimensions.timeliness >= 0 &&
                        dimensions.timeliness <= 100

  // Validate and normalize weights
  const normalizedWeights = { ...weights }
  let totalWeight = 0

  // Calculate total weight for available dimensions
  totalWeight += normalizedWeights.completeness || 0
  totalWeight += normalizedWeights.uniqueness || 0
  totalWeight += normalizedWeights.consistency || 0
  totalWeight += normalizedWeights.validity || 0
  
  if (hasTimeliness) {
    totalWeight += normalizedWeights.timeliness || 0
  }

  // If no timeliness, redistribute its weight proportionally
  if (!hasTimeliness && normalizedWeights.timeliness) {
    const timelinessWeight = normalizedWeights.timeliness
    const otherWeights = totalWeight
    if (otherWeights > 0) {
      // Redistribute timeliness weight proportionally to other dimensions
      const scaleFactor = (otherWeights + timelinessWeight) / otherWeights
      normalizedWeights.completeness *= scaleFactor
      normalizedWeights.uniqueness *= scaleFactor
      normalizedWeights.consistency *= scaleFactor
      normalizedWeights.validity *= scaleFactor
      totalWeight = otherWeights + timelinessWeight
    }
  }

  // Normalize weights to sum to 1.0 (if they don't already)
  if (totalWeight > 0 && Math.abs(totalWeight - 1.0) > 0.001) {
    console.warn(`computeDQS: Weights sum to ${totalWeight}, normalizing to 1.0`)
    const scale = 1.0 / totalWeight
    normalizedWeights.completeness *= scale
    normalizedWeights.uniqueness *= scale
    normalizedWeights.consistency *= scale
    normalizedWeights.validity *= scale
    if (hasTimeliness) {
      normalizedWeights.timeliness *= scale
    }
    totalWeight = 1.0
  }

  if (totalWeight === 0) {
    console.warn('computeDQS: No valid weights, returning 0')
    return { dimensions, DQS: 0 }
  }

  // Calculate weighted average
  let weightedSum = 0

  weightedSum += dimensions.completeness * normalizedWeights.completeness
  weightedSum += dimensions.uniqueness * normalizedWeights.uniqueness
  weightedSum += dimensions.consistency * normalizedWeights.consistency
  weightedSum += dimensions.validity * normalizedWeights.validity

  if (hasTimeliness) {
    weightedSum += dimensions.timeliness * normalizedWeights.timeliness
  }

  // Round to nearest integer
  const DQS = Math.round(weightedSum)

  // Ensure DQS is within valid range
  const clampedDQS = Math.max(0, Math.min(100, DQS))

  return {
    dimensions,
    DQS: clampedDQS,
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/CommonJS
  module.exports = {
    computeCompleteness,
    computeUniqueness,
    computeConsistency,
    computeValidity,
    computeTimeliness,
    computeAllScores,
    computeDQS,
    DEFAULT_WEIGHTS,
  }
} else if (typeof window !== 'undefined') {
  // Browser
  window.DataQuality = {
    computeCompleteness,
    computeUniqueness,
    computeConsistency,
    computeValidity,
    computeTimeliness,
    computeAllScores,
    computeDQS,
    DEFAULT_WEIGHTS,
  }
}

