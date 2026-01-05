# Data Quality Scoring Backend

Express + TypeScript backend for the Data Quality Scoring platform.

## Features

- **CSV File Upload & Analysis**: Parse CSV files and compute data quality scores
- **Deterministic Scoring**: All scores computed using explainable algorithms
- **LLM-Powered Explanations**: OpenAI integration for plain-English explanations (with fallback)
- **Production-Ready**: Error handling, validation, and type safety

## API Endpoints

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "data-quality-backend"
}
```

### POST `/analyze`

Analyze a CSV file and compute data quality scores.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `file`
- File type: CSV

**Response:**
```json
{
  "dimensions": {
    "completeness": 85,
    "uniqueness": 92,
    "consistency": 78,
    "validity": 88,
    "timeliness": 95
  },
  "DQS": 88,
  "metadata": {
    "rowCount": 1000,
    "columnCount": 5,
    "columns": ["id", "name", "email", "date", "status"]
  }
}
```

### POST `/explain`

Generate LLM-powered explanation and recommendations based on scores.

**Request Body:**
```json
{
  "dimensions": {
    "completeness": 85,
    "uniqueness": 92,
    "consistency": 78,
    "validity": 88,
    "timeliness": 95
  },
  "DQS": 88
}
```

**Response:**
```json
{
  "explanation": "Overall Data Quality Score: 88/100. Data quality is strong across most dimensions...",
  "recommendations": [
    {
      "severity": "Medium",
      "text": "Improve consistency by standardizing data formats...",
      "impact": "Operations"
    }
  ]
}
```

## Installation

```bash
# Install dependencies
npm install

# Or with pnpm
pnpm install
```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Gemini API key (optional):
   ```env
   GEMINI_API_KEY=your-api-key-here
   ```
   
   Get your API key from: https://makersuite.google.com/app/apikey

## Development

```bash
# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type check
npm run type-check
```

## Usage Examples

### Using curl

```bash
# Health check
curl http://localhost:3001/health

# Analyze CSV file
curl -X POST http://localhost:3001/analyze \
  -F "file=@data.csv"

# Generate explanation
curl -X POST http://localhost:3001/explain \
  -H "Content-Type: application/json" \
  -d '{
    "dimensions": {
      "completeness": 85,
      "uniqueness": 92,
      "consistency": 78,
      "validity": 88,
      "timeliness": 95
    },
    "DQS": 88
  }'
```

### Using JavaScript/TypeScript

```typescript
// Analyze CSV
const formData = new FormData()
formData.append('file', csvFile)

const analyzeResponse = await fetch('http://localhost:3001/analyze', {
  method: 'POST',
  body: formData,
})
const analysis = await analyzeResponse.json()

// Generate explanation
const explainResponse = await fetch('http://localhost:3001/explain', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dimensions: analysis.dimensions,
    DQS: analysis.DQS,
  }),
})
const explanation = await explainResponse.json()
```

## Scoring Logic

All scoring is **deterministic** and **explainable**:

- **Completeness**: Percentage of non-empty values
- **Uniqueness**: Percentage of unique values per column (averaged)
- **Consistency**: Format consistency across rows
- **Validity**: Percentage of rows with valid key fields
- **Timeliness**: Data freshness based on date column (if available)

**DQS (Data Quality Score)**: Average of all dimension scores

## Error Handling

All endpoints return clear error messages:

- `400 Bad Request`: Invalid input (malformed CSV, missing fields, etc.)
- `500 Internal Server Error`: Server-side errors with error messages

## Notes

- CSV files are limited to 10MB
- Only CSV files are accepted (`.csv` extension or `text/csv` MIME type)
- If `OPENAI_API_KEY` is not set, `/explain` uses deterministic explanations
- All scores are integers between 0 and 100

