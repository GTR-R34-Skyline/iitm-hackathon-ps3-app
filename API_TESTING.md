# API Testing Guide

Quick reference for testing the API endpoints.

## Prerequisites

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. The server will run on `http://localhost:3000`

## Testing Endpoints

### 1. Get Complete Dataset Analysis

```bash
# Payment Transactions
curl http://localhost:3000/api/dataset?datasetId=payment-transactions

# KYC Records
curl http://localhost:3000/api/dataset?datasetId=kyc-records

# Settlement Data
curl http://localhost:3000/api/dataset?datasetId=settlement-data
```

### 2. Get Scores Only

```bash
curl http://localhost:3000/api/score?datasetId=payment-transactions
```

### 3. Get Explanations (POST)

```bash
curl -X POST http://localhost:3000/api/explain \
  -H "Content-Type: application/json" \
  -d '{"datasetId": "payment-transactions"}'
```

## Expected Response Structure

All endpoints return JSON responses. The `/api/dataset` endpoint returns:

- `id`: Dataset identifier
- `name`: Dataset display name
- `compositeScore`: Overall quality score (0-100)
- `dimensions`: Array of 7 dimension scores
- `insights`: Array of data quality insights
- `recommendations`: Array of prioritized recommendations
- `trend`: Historical trend data (4 months)

## Notes

- Scores are computed deterministically based on generated metadata
- Each request generates new metadata (scores may vary slightly)
- If `OPENAI_API_KEY` is set, `/api/explain` uses GenAI; otherwise uses deterministic explanations
- All endpoints handle errors gracefully with appropriate HTTP status codes

