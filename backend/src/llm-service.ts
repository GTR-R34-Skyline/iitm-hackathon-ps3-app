import { GoogleGenAI } from "@google/genai";
import { ExplanationRequest, ExplanationResponse, Recommendation } from "./types";

// Initialize with your new Gemini API key
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Enhanced Gemini service using Structured Outputs to prevent parsing errors
 */
async function generateGeminiExplanation(request: ExplanationRequest): Promise<ExplanationResponse> {
  const { dimensions, DQS } = request;
  
  // Gemini 2.5 Flash is highly optimized for fast, structured data tasks
  const model = "gemini-2.5-flash";

  const prompt = `Analyze these data quality scores and provide insights:
    Overall DQS: ${DQS}/100
    Completeness: ${dimensions.completeness}%
    Uniqueness: ${dimensions.uniqueness}%
    Consistency: ${dimensions.consistency}%
    Validity: ${dimensions.validity}%
    ${dimensions.timeliness ? `Timeliness: ${dimensions.timeliness}%` : ""}`;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        // Enforces pure JSON output without markdown backticks
        responseMimeType: "application/json",
        // This schema maps exactly to your ExplanationResponse interface
        responseSchema: {
          type: "object",
          properties: {
            explanation: { type: "string", description: "A 2-3 sentence analysis of the data." },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { enum: ["High", "Medium", "Low"] },
                  text: { type: "string" },
                  impact: { enum: ["Compliance", "Operations", "Analytics"] }
                },
                required: ["severity", "text", "impact"]
              }
            }
          },
          required: ["explanation", "recommendations"]
        }
      },
    });

    // With responseMimeType: "application/json", response.text is guaranteed to be raw JSON
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini service error:", error);
    // Safe fallback to your existing deterministic function
    return generateDeterministicExplanation(request);
  }
}

export async function generateExplanation(request: ExplanationRequest): Promise<ExplanationResponse> {
  if (!process.env.GEMINI_API_KEY) {
    return generateDeterministicExplanation(request);
  }
  return await generateGeminiExplanation(request);
}