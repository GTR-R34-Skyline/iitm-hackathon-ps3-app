/**
 * API Configuration
 * For Next.js App Router API routes
 */

export const API_ENDPOINTS = {
  analyze: "/api/analyze", // Added this missing route
  dataset: "/api/dataset",
  score: "/api/score",
  explain: "/api/explain",
} as const;