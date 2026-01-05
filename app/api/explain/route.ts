export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dimensions, DQS } = body;

    if (!dimensions || DQS === undefined) {
      console.error("Missing dimensions or DQS:", { dimensions, DQS });
      return NextResponse.json(
        { error: "Missing dimensions or DQS" },
        { status: 400 }
      );
    }

    console.log("✅ Explain API received:", { dimensions, DQS });

    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ No GEMINI_API_KEY, using fallback");
      return NextResponse.json(generateLocalFallback(dimensions, DQS));
    }

    const prompt = `You are a data quality expert. Analyze these data quality scores and provide insights in JSON format.

Data Quality Scores:
- Overall DQS: ${DQS}%
- Completeness: ${dimensions.completeness}%
- Uniqueness: ${dimensions.uniqueness}%
- Consistency: ${dimensions.consistency}%
- Validity: ${dimensions.validity}%
${dimensions.timeliness ? `- Timeliness: ${dimensions.timeliness}%` : ""}

IMPORTANT: Return ONLY a JSON object, nothing else. No markdown, no code blocks, no explanation text before or after.

{
  "explanation": "A brief 2-3 sentence summary of the overall data quality status",
  "recommendations": [
    {"severity": "High", "text": "Action to fix critical issues", "impact": "Operations"},
    {"severity": "Medium", "text": "Action to improve quality", "impact": "Analytics"},
    {"severity": "Low", "text": "Long-term improvement suggestion", "impact": "Operations"}
  ]
}`;

    console.log("📤 Sending prompt to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.1,
      },
    });

    console.log("📥 Raw Gemini response:", response.text);

    // Parse the JSON response
    let parsedResponse;
    try {
      let jsonText = response.text.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/, "").replace(/```\n?$/, "").trim();
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/, "").replace(/```\n?$/, "").trim();
      }

      console.log("🔍 Cleaned JSON text:", jsonText);
      
      parsedResponse = JSON.parse(jsonText);
      console.log("✅ Successfully parsed JSON:", parsedResponse);
    } catch (parseErr) {
      console.error("❌ Failed to parse Gemini response:", response.text);
      console.error("Parse error details:", parseErr);
      return NextResponse.json(generateLocalFallback(dimensions, DQS));
    }

    // Validate and structure recommendations
    const recommendations = Array.isArray(parsedResponse.recommendations)
      ? parsedResponse.recommendations
          .map((rec: any) => ({
            severity: ["High", "Medium", "Low"].includes(rec.severity)
              ? rec.severity
              : "Medium",
            text: rec.text || "Review data quality",
            impact: rec.impact || "Operations",
          }))
          .slice(0, 3)
      : [];

    const finalResult = {
      explanation:
        parsedResponse.explanation ||
        "Review the data quality scores for insights.",
      recommendations:
        recommendations.length > 0
          ? recommendations
          : [
              {
                severity: "Medium",
                text: "Review your data quality dimensions",
                impact: "Operations",
              },
            ],
    };

    console.log("✅ Returning final result:", finalResult);
    return NextResponse.json(finalResult);

  } catch (err) {
    console.error("❌ Explain API Error:", err);
    console.error("Error details:", err instanceof Error ? err.message : String(err));

    // Return a sensible fallback
    return NextResponse.json(
      {
        explanation:
          "Unable to generate explanation due to a server error. Please review your quality scores.",
        recommendations: [
          {
            severity: "Medium",
            text: "Review dimensions with scores below 80%",
            impact: "Operations",
          },
          {
            severity: "Low",
            text: "Implement data quality monitoring",
            impact: "Operations",
          },
        ],
      },
      { status: 200 }
    );
  }
}

function generateLocalFallback(
  dimensions: any,
  DQS: number
): {
  explanation: string;
  recommendations: Array<{
    severity: "High" | "Medium" | "Low";
    text: string;
    impact: string;
  }>;
} {
  const issues = [];

  if (dimensions.completeness < 80)
    issues.push("completeness is low");
  if (dimensions.uniqueness < 80) issues.push("uniqueness needs improvement");
  if (dimensions.consistency < 80)
    issues.push("consistency issues detected");
  if (dimensions.validity < 80) issues.push("validity concerns");

  const issueText =
    issues.length > 0
      ? `Key areas to address: ${issues.join(", ")}.`
      : "Your dataset quality is generally good.";

  return {
    explanation: `Your dataset has an overall DQS of ${DQS}%. ${issueText} Focus on improving low-scoring dimensions.`,
    recommendations: [
      {
        severity: dimensions.completeness < 80 ? "High" : "Medium",
        text: "Reduce null and empty values to improve completeness",
        impact: "Operations",
      },
      {
        severity: dimensions.consistency < 80 ? "High" : "Medium",
        text: "Standardize data formats and validate field consistency",
        impact: "Operations",
      },
      {
        severity: "Low",
        text: "Set up continuous data quality monitoring",
        impact: "Operations",
      },
    ],
  };
}