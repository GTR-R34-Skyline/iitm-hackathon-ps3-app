/**
 * Example usage of GenAI explanation layer
 */

import { generateExplanation } from "./genai-explanation"

async function example() {
  // Example 1: Basic usage with dimension scores and DQS
  console.log("Example 1: Basic Explanation")
  const dimensions1 = {
    completeness: 85,
    uniqueness: 92,
    consistency: 78,
    validity: 88,
    timeliness: 95,
  }

  const explanation1 = await generateExplanation(dimensions1, 88)
  console.log("Summary:", explanation1.explanation)
  console.log("Recommendations:", explanation1.recommendations)
  console.log()

  // Example 2: With metadata
  console.log("Example 2: With Metadata")
  const dimensions2 = {
    completeness: 62,
    uniqueness: 91,
    consistency: 74,
    validity: 70,
    timeliness: 88,
  }

  const metadata = {
    rowCount: 25000,
    columnCount: 9,
    columns: [
      "transaction_id",
      "merchant_id",
      "amount",
      "currency",
      "timestamp",
      "status",
      "customer_id",
      "payment_method",
      "merchant_address",
    ],
  }

  const explanation2 = await generateExplanation(dimensions2, 77, metadata)
  console.log("Summary:", explanation2.explanation)
  console.log("Recommendations:", explanation2.recommendations)
  console.log()

  // Example 3: Without timeliness
  console.log("Example 3: Without Timeliness")
  const dimensions3 = {
    completeness: 75,
    uniqueness: 80,
    consistency: 70,
    validity: 85,
    // timeliness not provided
  }

  const explanation3 = await generateExplanation(dimensions3, 77)
  console.log("Summary:", explanation3.explanation)
  console.log("Recommendations:", explanation3.recommendations)
  console.log()

  // Example 4: Low quality data (high priority issues)
  console.log("Example 4: Low Quality Data")
  const dimensions4 = {
    completeness: 45,
    uniqueness: 55,
    consistency: 60,
    validity: 50,
    timeliness: 95,
  }

  const explanation4 = await generateExplanation(dimensions4, 61)
  console.log("Summary:", explanation4.explanation)
  console.log("Recommendations:", explanation4.recommendations)
}

// Run example if executed directly
if (require.main === module) {
  example().catch(console.error)
}

