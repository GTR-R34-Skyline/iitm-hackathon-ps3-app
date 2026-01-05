# GenAI Explanation Layer

Enterprise-grade explanation generation for data quality assessments using LLM (OpenAI GPT-4o-mini).

## Overview

The GenAI explanation layer provides business-friendly, compliance-aware explanations of data quality scores. It is designed to communicate with non-technical stakeholders including executives, compliance officers, and operations teams.

## Security & Privacy

### ✅ What GenAI Sees

- **Dimension scores**: Completeness, uniqueness, consistency, validity, timeliness
- **Composite DQS**: Overall data quality score (0-100)
- **Dataset metadata**: Row count, column count, column names (field names only)

### ❌ What GenAI Does NOT See

- **Raw data values**: No actual data from rows
- **Individual records**: No row-level information
- **PII or sensitive data**: No personal or transaction details
- **Sample data**: No examples from the dataset

This ensures compliance with privacy regulations and prevents data leakage.

## Usage

### Basic Usage

```typescript
import { generateExplanation } from "./genai-explanation"

const dimensions = {
  completeness: 85,
  uniqueness: 92,
  consistency: 78,
  validity: 88,
  timeliness: 95,
}

const explanation = await generateExplanation(dimensions, 88)

console.log(explanation.explanation)
// "Overall Data Quality Score: 88/100. Data quality is strong..."

console.log(explanation.recommendations)
// Array of 3 recommendations with severity and impact
```

### With Metadata

```typescript
const metadata = {
  rowCount: 25000,
  columnCount: 9,
  columns: ["id", "name", "email", "date", "status"],
}

const explanation = await generateExplanation(dimensions, 88, metadata)
```

### Without Timeliness

```typescript
const dimensions = {
  completeness: 85,
  uniqueness: 92,
  consistency: 78,
  validity: 88,
  // timeliness not provided (optional)
}

const explanation = await generateExplanation(dimensions, 86)
```

## Response Format

```typescript
interface ExplanationResponse {
  explanation: string  // Overall summary (2-3 sentences)
  recommendations: Array<{
    severity: "High" | "Medium" | "Low"
    text: string
    impact: "Compliance" | "Operations" | "Analytics"
  }>  // Exactly 3 recommendations
}
```

## Explanation Components

### 1. Overall Summary

- 2-3 sentences describing current data quality state
- Business-focused language
- Compliance and risk context

### 2. Key Problem Areas

- Identifies dimensions with scores < 70
- Explains business impact
- Mentions compliance/operational risks

### 3. Prioritized Recommendations

Exactly 3 recommendations, prioritized by:
- **Severity**: High (critical), Medium (important), Low (monitor)
- **Impact**: Compliance, Operations, or Analytics
- **Actionability**: Clear, specific actions

## Tone & Language

### Enterprise
- Professional and formal
- Business terminology
- Executive-friendly

### Compliance-Aware
- Mentions regulatory implications
- References audit requirements
- Emphasizes risk management

### Non-Technical
- Avoids technical jargon
- Uses business language
- Clear and accessible

### Example

**Technical (Bad):**
> "The dataset has a 15% null value rate in the merchant_address field, indicating insufficient data validation in the ETL pipeline."

**Business-Friendly (Good):**
> "15% of merchant records are missing address information, which may impact compliance reporting and transaction verification processes."

## Fallback Behavior

If OpenAI API is unavailable or fails:

1. Falls back to deterministic explanations
2. Uses rule-based logic to generate summaries
3. Provides prioritized recommendations based on score thresholds
4. Maintains same response format

## Configuration

### Environment Variable

```bash
GEMINI_API_KEY=your-api-key-here
```

Get your API key from: https://makersuite.google.com/app/apikey

If not set, the system uses deterministic fallback explanations.

### Model Settings

- **Model**: gemini-1.5-flash
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max Output Tokens**: 800
- **Response Format**: JSON object

## Prompt Template

The prompt template is stored in `genai-explanation.ts` and can be exported for documentation/testing:

```typescript
import { EXPLANATION_PROMPT_TEMPLATE } from "./genai-explanation"

console.log(EXPLANATION_PROMPT_TEMPLATE)
```

See `prompt-template.md` for detailed template documentation.

## Error Handling

- API errors: Falls back to deterministic explanation
- Invalid responses: Validates structure, falls back if invalid
- Missing API key: Uses deterministic fallback
- Network errors: Logs error, uses fallback

All errors are handled gracefully - the system never crashes due to LLM issues.

## API Provider

This implementation uses **Google Gemini API** (gemini-1.5-flash model).

### Why Gemini?

- Fast response times
- Strong JSON generation capabilities
- Cost-effective
- Good compliance with structured output requirements

## Best Practices

1. **Always validate inputs**: Ensure dimension scores are 0-100
2. **Use metadata when available**: Provides context for better explanations
3. **Handle async properly**: Function returns a Promise
4. **Monitor API usage**: Track OpenAI API calls and costs
5. **Review explanations**: Periodically review for quality and accuracy

## Testing

See `genai-explanation.example.ts` for usage examples.

To test without API key (uses fallback):
```bash
# Don't set OPENAI_API_KEY
node -r ts-node/register src/genai-explanation.example.ts
```

To test with API key:
```bash
export OPENAI_API_KEY=sk-your-key
node -r ts-node/register src/genai-explanation.example.ts
```

