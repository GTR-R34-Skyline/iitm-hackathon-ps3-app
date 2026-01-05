/**
 * GenAI Explanation Layer for Data Quality Scoring
 * 
 * Generates enterprise-grade, compliance-aware explanations using LLM.
 * 
 * Rules:
 * - GenAI only sees dimension scores and metadata (NO raw data)
 * - Explains in non-technical, business-friendly language
 * - Focus on compliance, risk, and actionable insights
 */

import { ExplanationRequest, ExplanationResponse, Recommendation } from "./types"

/**
 * Prompt template for GenAI explanations
 * 
 * This template ensures:
 * - Only dimension scores and metadata are provided
 * - Enterprise/compliance tone
 * - Non-technical language
 * - Structured output format
 */
const EXPLANATION_PROMPT_TEMPLATE = `You are a data quality analyst for an enterprise payment processing platform. Your role is to provide clear, business-friendly explanations of data quality assessments to stakeholders including executives, compliance officers, and operations teams.

Analyze the following data quality metrics and provide an explanation.

DATA QUALITY METRICS:
- Overall Data Quality Score (DQS): {DQS}/100
- Completeness: {completeness}/100
- Uniqueness: {uniqueness}/100
- Consistency: {consistency}/100
- Validity: {validity}/100
{timeliness_section}

DATASET INFORMATION:
{DatasetInfo}

INSTRUCTIONS:
1. Provide an overall data quality summary (2-3 sentences) that explains the current state in business terms
2. Identify key problem areas (1-2 sentences per issue, focus on business impact)
3. Provide exactly 3 prioritized improvement actions with:
   - Severity: High, Medium, or Low
   - Clear, actionable recommendation
   - Impact category: Compliance, Operations, or Analytics

TONE REQUIREMENTS:
- Enterprise and professional
- Compliance-aware (mention regulatory/audit implications where relevant)
- Non-technical (avoid jargon, use business language)
- Actionable (focus on what to do, not technical details)
- Risk-focused (emphasize business consequences)

RESPONSE FORMAT (JSON only, no markdown):
{
  "summary": "Overall data quality summary in 2-3 sentences...",
  "problemAreas": [
    "Key problem area 1 with business impact",
    "Key problem area 2 with business impact"
  ],
  "recommendations": [
    {
      "severity": "High|Medium|Low",
      "text": "Clear, actionable recommendation",
      "impact": "Compliance|Operations|Analytics"
    }
  ]
}

Return ONLY valid JSON, no additional text or markdown formatting.`

/**
 * Build dataset information string from metadata
 */
function buildDatasetInfo(metadata?: {
  rowCount?: number
  columnCount?: number
  columns?: string[]
}): string {
  if (!metadata) {
    return "Dataset metadata not available."
  }

  const parts: string[] = []
  
  if (metadata.rowCount !== undefined) {
    parts.push(`- Record count: ${metadata.rowCount.toLocaleString()}`)
  }
  
  if (metadata.columnCount !== undefined) {
    parts.push(`- Field count: ${metadata.columnCount}`)
  }
  
  if (metadata.columns && metadata.columns.length > 0) {
    const columnList = metadata.columns.slice(0, 10).join(", ")
    const more = metadata.columns.length > 10 ? ` (and ${metadata.columns.length - 10} more)` : ""
    parts.push(`- Fields: ${columnList}${more}`)
  }

  return parts.length > 0 ? parts.join("\n") : "Dataset metadata not available."
}

/**
 * Build prompt from template and data
 */
function buildPrompt(
  dimensions: {
    completeness: number
    uniqueness: number
    consistency: number
    validity: number
    timeliness?: number
  },
  DQS: number,
  metadata?: {
    rowCount?: number
    columnCount?: number
    columns?: string[]
  }
): string {
  let prompt = EXPLANATION_PROMPT_TEMPLATE

  // Replace dimension scores
  prompt = prompt.replace("{DQS}", String(DQS))
  prompt = prompt.replace("{completeness}", String(dimensions.completeness))
  prompt = prompt.replace("{uniqueness}", String(dimensions.uniqueness))
  prompt = prompt.replace("{consistency}", String(dimensions.consistency))
  prompt = prompt.replace("{validity}", String(dimensions.validity))

  // Handle timeliness (optional)
  if (dimensions.timeliness !== undefined) {
    prompt = prompt.replace(
      "{timeliness_section}",
      `- Timeliness: ${dimensions.timeliness}/100`
    )
  } else {
    prompt = prompt.replace("{timeliness_section}", "")
  }

  // Replace dataset info
  const datasetInfo = buildDatasetInfo(metadata)
  prompt = prompt.replace("{DatasetInfo}", datasetInfo)

  return prompt
}

/**
 * Parse and validate LLM response
 */
function parseLLMResponse(content: string): {
  summary: string
  problemAreas: string[]
  recommendations: Recommendation[]
} {
  // Clean content (remove markdown code blocks if present)
  let jsonContent = content.trim()
  if (jsonContent.startsWith("```json")) {
    jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?$/g, "")
  } else if (jsonContent.startsWith("```")) {
    jsonContent = jsonContent.replace(/```\n?/g, "")
  }

  // Parse JSON
  const parsed = JSON.parse(jsonContent)

  // Validate structure
  if (!parsed.summary || typeof parsed.summary !== "string") {
    throw new Error("Invalid response: missing or invalid summary")
  }

  if (!Array.isArray(parsed.problemAreas)) {
    throw new Error("Invalid response: missing or invalid problemAreas")
  }

  if (!Array.isArray(parsed.recommendations)) {
    throw new Error("Invalid response: missing or invalid recommendations")
  }

  // Validate and format recommendations
  const recommendations: Recommendation[] = parsed.recommendations.slice(0, 3).map((rec: any) => {
    if (!rec.text || typeof rec.text !== "string") {
      throw new Error("Invalid recommendation: missing text")
    }

    // Validate severity
    const validSeverities = ["High", "Medium", "Low"]
    const severity = validSeverities.includes(rec.severity) ? rec.severity : "Medium"

    // Validate impact
    const validImpacts = ["Compliance", "Operations", "Analytics"]
    const impact = validImpacts.includes(rec.impact) ? rec.impact : "Operations"

    return {
      severity: severity as "High" | "Medium" | "Low",
      text: rec.text,
      impact: impact as "Compliance" | "Operations" | "Analytics",
    }
  })

  // Ensure exactly 3 recommendations
  if (recommendations.length !== 3) {
    throw new Error(`Expected exactly 3 recommendations, got ${recommendations.length}`)
  }

  return {
    summary: parsed.summary,
    problemAreas: parsed.problemAreas || [],
    recommendations,
  }
}

/**
 * Generate explanation using Google Gemini API
 */
async function generateGeminiExplanation(
  dimensions: {
    completeness: number
    uniqueness: number
    consistency: number
    validity: number
    timeliness?: number
  },
  DQS: number,
  apiKey: string,
  metadata?: {
    rowCount?: number
    columnCount?: number
    columns?: string[]
  }
): Promise<ExplanationResponse> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai")
  const genAI = new GoogleGenerativeAI(apiKey)
  
  const prompt = buildPrompt(dimensions, DQS, metadata)

  // Create model with system instruction and JSON response format
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a data quality analyst for an enterprise payment processing platform. Provide clear, business-friendly explanations in JSON format only. Focus on compliance, risk, and actionable insights. Always return valid JSON with no markdown formatting.",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
      responseMimeType: "application/json",
    },
  })

  const result = await model.generateContent(prompt)

  const response = result.response
  const content = response.text().trim()
  
  if (!content) {
    throw new Error("No response from Gemini")
  }

  const parsed = parseLLMResponse(content)

  // Format as ExplanationResponse
  return {
    explanation: parsed.summary,
    recommendations: parsed.recommendations,
  }
}

/**
 * Generate deterministic fallback explanation
 * Used when LLM is unavailable or fails
 */
function generateFallbackExplanation(
  dimensions: {
    completeness: number
    uniqueness: number
    consistency: number
    validity: number
    timeliness?: number
  },
  DQS: number
): ExplanationResponse {
  // Build summary
  let summary = `Overall Data Quality Score: ${DQS}/100. `
  
  if (DQS >= 80) {
    summary += "Data quality is strong and meets enterprise standards for payment processing. "
  } else if (DQS >= 60) {
    summary += "Data quality is acceptable but requires improvement to meet compliance and operational standards. "
  } else {
    summary += "Data quality is below acceptable thresholds and poses compliance and operational risks. "
  }

  summary += "Review key problem areas and implement recommended improvements."

  // Identify problem areas
  const problemAreas: string[] = []
  if (dimensions.completeness < 70) {
    problemAreas.push(`Completeness is ${dimensions.completeness}% - missing data may impact regulatory reporting and transaction processing.`)
  }
  if (dimensions.validity < 70) {
    problemAreas.push(`Validity is ${dimensions.validity}% - invalid data entries violate business rules and may cause transaction failures.`)
  }
  if (dimensions.uniqueness < 70) {
    problemAreas.push(`Uniqueness is ${dimensions.uniqueness}% - duplicate records can cause reconciliation issues and analytics inaccuracies.`)
  }
  if (dimensions.consistency < 70) {
    problemAreas.push(`Consistency is ${dimensions.consistency}% - format inconsistencies require manual cleanup and affect data integration.`)
  }

  // Generate recommendations
  const recommendations: Recommendation[] = []

  if (dimensions.completeness < 70) {
    recommendations.push({
      severity: dimensions.completeness < 50 ? "High" : "Medium",
      text: "Implement mandatory field validation and data enrichment processes to improve completeness and ensure regulatory compliance.",
      impact: "Compliance",
    })
  }

  if (dimensions.validity < 70) {
    recommendations.push({
      severity: dimensions.validity < 50 ? "High" : "Medium",
      text: "Enforce schema validation and business rule checks at data ingestion to prevent invalid entries and transaction failures.",
      impact: "Compliance",
    })
  }

  if (dimensions.uniqueness < 70) {
    recommendations.push({
      severity: dimensions.uniqueness < 50 ? "High" : "Medium",
      text: "Run deduplication processes and enforce unique constraints on key fields to improve data integrity and analytics accuracy.",
      impact: "Analytics",
    })
  }

  if (dimensions.consistency < 70 && recommendations.length < 3) {
    recommendations.push({
      severity: "Medium",
      text: "Standardize data formats and implement format validation in data pipelines to reduce manual cleanup efforts.",
      impact: "Operations",
    })
  }

  // Fill to 3 recommendations if needed
  while (recommendations.length < 3) {
    recommendations.push({
      severity: "Low",
      text: "Continue monitoring data quality metrics and maintain current data governance processes.",
      impact: "Operations",
    })
  }

  return {
    explanation: summary,
    recommendations: recommendations.slice(0, 3),
  }
}

/**
 * Main function: Generate GenAI-powered explanation
 * 
 * Rules enforced:
 * - Only dimension scores and metadata are sent to LLM (NO raw data)
 * - Falls back to deterministic explanation if LLM unavailable
 * - Enterprise/compliance tone
 * - Non-technical language
 * 
 * @param dimensions - Dimension scores
 * @param DQS - Composite Data Quality Score
 * @param metadata - Optional dataset metadata (row count, columns, etc.)
 * @returns Explanation with summary and 3 recommendations
 */
export async function generateExplanation(
  dimensions: {
    completeness: number
    uniqueness: number
    consistency: number
    validity: number
    timeliness?: number
  },
  DQS: number,
  metadata?: {
    rowCount?: number
    columnCount?: number
    columns?: string[]
  }
): Promise<ExplanationResponse> {
  const apiKey = process.env.GEMINI_API_KEY

  // Use deterministic fallback if no API key
  if (!apiKey) {
    return generateFallbackExplanation(dimensions, DQS)
  }

  try {
    return await generateGeminiExplanation(dimensions, DQS, apiKey, metadata)
  } catch (error) {
    console.error("GenAI explanation error, using fallback:", error)
    // Fallback to deterministic on error
    return generateFallbackExplanation(dimensions, DQS)
  }
}

/**
 * Export prompt template for testing/documentation
 */
export { EXPLANATION_PROMPT_TEMPLATE, buildPrompt, buildDatasetInfo }

