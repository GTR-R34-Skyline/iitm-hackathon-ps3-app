/**
 * Example usage of composite DQS scoring engine
 */

const {
  computeAllScores,
  computeDQS,
  DEFAULT_WEIGHTS,
} = require('./data-quality-functions.js')

// Sample data
const sampleRows = [
  { id: '1', name: 'John Doe', email: 'john@example.com', date: '2024-01-15', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', date: '2024-01-14', status: 'active' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', date: '2024-01-13', status: 'inactive' },
]

// Example 1: Compute DQS with default weights
console.log('Example 1: Default Weights')
const dimensions = computeAllScores(sampleRows)
const result1 = computeDQS(dimensions)
console.log('Dimensions:', result1.dimensions)
console.log('DQS:', result1.DQS)
console.log()

// Example 2: Custom weights (equal weighting)
console.log('Example 2: Equal Weights')
const equalWeights = {
  completeness: 0.2,
  uniqueness: 0.2,
  consistency: 0.2,
  validity: 0.2,
  timeliness: 0.2,
}
const result2 = computeDQS(dimensions, equalWeights)
console.log('DQS (equal weights):', result2.DQS)
console.log()

// Example 3: Emphasize completeness and validity
console.log('Example 3: Compliance-Focused Weights')
const complianceWeights = {
  completeness: 0.35,  // Higher weight for compliance
  uniqueness: 0.15,
  consistency: 0.10,
  validity: 0.35,      // Higher weight for compliance
  timeliness: 0.05,    // Lower weight
}
const result3 = computeDQS(dimensions, complianceWeights)
console.log('DQS (compliance-focused):', result3.DQS)
console.log()

// Example 4: Without timeliness
console.log('Example 4: Without Timeliness')
const dimensionsNoTimeliness = {
  completeness: 85,
  uniqueness: 90,
  consistency: 80,
  validity: 88,
  // timeliness not provided
}
const result4 = computeDQS(dimensionsNoTimeliness)
console.log('Dimensions:', result4.dimensions)
console.log('DQS (no timeliness):', result4.DQS)
console.log()

// Example 5: Complete workflow
console.log('Example 5: Complete Workflow')
function analyzeDataQuality(rows, customWeights = null) {
  // Step 1: Compute dimension scores
  const dimensionScores = computeAllScores(rows)
  
  // Step 2: Compute composite DQS
  const weights = customWeights || DEFAULT_WEIGHTS
  const result = computeDQS(dimensionScores, weights)
  
  return result
}

const analysis = analyzeDataQuality(sampleRows)
console.log('Complete Analysis:')
console.log(JSON.stringify(analysis, null, 2))

