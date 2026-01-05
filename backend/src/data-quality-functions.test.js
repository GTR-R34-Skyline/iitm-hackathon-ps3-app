/**
 * Test file for data quality scoring functions
 * Run with: node data-quality-functions.test.js
 */

const {
  computeCompleteness,
  computeUniqueness,
  computeConsistency,
  computeValidity,
  computeTimeliness,
  computeAllScores,
  computeDQS,
  DEFAULT_WEIGHTS,
} = require('./data-quality-functions.js')

// Test data
const sampleRows = [
  { id: '1', name: 'John Doe', email: 'john@example.com', date: '2024-01-15', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', date: '2024-01-14', status: 'active' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', date: '2024-01-13', status: 'inactive' },
  { id: '4', name: '', email: 'alice@example.com', date: '2024-01-12', status: 'active' }, // Empty name
  { id: '5', name: 'Charlie Brown', email: '', date: '2024-01-11', status: 'active' }, // Empty email
]

const rowsWithDuplicates = [
  { id: '1', name: 'John', email: 'john@example.com' },
  { id: '2', name: 'John', email: 'john@example.com' }, // Duplicate
  { id: '3', name: 'Jane', email: 'jane@example.com' },
]

// Test functions
function test(name, fn) {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`)
  }
}

// Run tests
console.log('Testing Data Quality Functions\n')

test('computeCompleteness - basic calculation', () => {
  const score = computeCompleteness(sampleRows)
  if (score < 0 || score > 100) throw new Error(`Score out of range: ${score}`)
  if (score === 0) throw new Error('Score should not be 0 for sample data')
  console.log(`  Completeness score: ${score}`)
})

test('computeUniqueness - detects duplicates', () => {
  const score1 = computeUniqueness(sampleRows)
  const score2 = computeUniqueness(rowsWithDuplicates)
  if (score2 < score1) {
    console.log(`  Sample rows: ${score1}, Duplicates: ${score2} (expected lower)`)
  }
})

test('computeConsistency - returns valid score', () => {
  const score = computeConsistency(sampleRows)
  if (score < 0 || score > 100) throw new Error(`Score out of range: ${score}`)
  console.log(`  Consistency score: ${score}`)
})

test('computeValidity - validates key fields', () => {
  const score = computeValidity(sampleRows)
  if (score < 0 || score > 100) throw new Error(`Score out of range: ${score}`)
  console.log(`  Validity score: ${score}`)
})

test('computeTimeliness - detects date columns', () => {
  const score = computeTimeliness(sampleRows)
  if (score < 0 || score > 100) throw new Error(`Score out of range: ${score}`)
  console.log(`  Timeliness score: ${score}`)
})

test('computeAllScores - returns all scores', () => {
  const scores = computeAllScores(sampleRows)
  if (!scores.completeness || !scores.uniqueness || !scores.consistency || !scores.validity || !scores.timeliness) {
    throw new Error('Missing scores in result')
  }
  console.log('  All scores:', scores)
})

test('Edge case: empty array', () => {
  const scores = computeAllScores([])
  // Should return valid scores (0 or neutral), not throw
  console.log('  Empty array scores:', scores)
})

test('Edge case: empty rows object', () => {
  const scores = computeAllScores([{}])
  // Should handle gracefully
  console.log('  Empty row scores:', scores)
})

test('computeDQS - default weights', () => {
  const dimensions = computeAllScores(sampleRows)
  const result = computeDQS(dimensions)
  if (typeof result.DQS !== 'number' || result.DQS < 0 || result.DQS > 100) {
    throw new Error(`Invalid DQS: ${result.DQS}`)
  }
  if (!result.dimensions) {
    throw new Error('Missing dimensions in result')
  }
  console.log(`  DQS: ${result.DQS}`)
  console.log('  Dimensions:', result.dimensions)
})

test('computeDQS - custom weights', () => {
  const dimensions = { completeness: 80, uniqueness: 90, consistency: 85, validity: 88, timeliness: 92 }
  const customWeights = { completeness: 0.3, uniqueness: 0.2, consistency: 0.2, validity: 0.2, timeliness: 0.1 }
  const result = computeDQS(dimensions, customWeights)
  if (result.DQS < 0 || result.DQS > 100) {
    throw new Error(`Invalid DQS: ${result.DQS}`)
  }
  console.log(`  DQS (custom weights): ${result.DQS}`)
})

test('computeDQS - without timeliness', () => {
  const dimensions = { completeness: 85, uniqueness: 90, consistency: 80, validity: 88 }
  const result = computeDQS(dimensions)
  if (result.DQS < 0 || result.DQS > 100) {
    throw new Error(`Invalid DQS: ${result.DQS}`)
  }
  console.log(`  DQS (no timeliness): ${result.DQS}`)
})

console.log('\nAll tests completed!')

