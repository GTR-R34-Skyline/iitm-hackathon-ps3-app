📊 Universal Data Quality Intelligence Platform

Problem Statement

GenAI Agent for Universal, Dimension-Based Data Quality Scoring in the Payments Domain

Payment organizations process massive volumes of transaction, KYC, and settlement data across multiple systems.
Today, there is no universal, objective, or explainable way to evaluate data quality across standard dimensions such as completeness, accuracy, consistency, timeliness, uniqueness, validity, and integrity.

This lack of standardized data quality measurement leads to:

- Unreliable analytics
- Increased regulatory and compliance risk
- Costly, manual investigations into data issues

🎯 Project Objective

This project presents a full-stack GenAI-driven Data Quality Intelligence Platform that demonstrates how payment data quality can be:

- Measured using a unified Data Quality Score (DQS)
- Explained in clear, business-friendly language using GenAI
- Improved through actionable, prioritized recommendations
- Audited with governance-ready, explainable outputs

The platform combines deterministic scoring logic with GenAI-powered explanations for a complete data quality assessment solution.

🧠 Solution Overview

The platform implements a complete data quality intelligence system that:

- **Evaluates datasets** across 7 standard data quality dimensions
- **Produces dimension-level scores** using deterministic, explainable logic
- **Computes a composite Data Quality Score (DQS)** as a weighted average
- **Generates plain-language explanations** using GenAI (OpenAI GPT-4o-mini) or deterministic fallback
- **Recommends actionable remediation steps** prioritized by severity and impact
- **Emphasizes privacy, governance, and auditability** through metadata-only processing

All data shown uses generated metadata for demonstration purposes only. No real payment or transaction data is stored or processed.

🖥️ Implementation Features

This repository contains a full-stack implementation with:

**Backend API Endpoints**

- `/api/dataset?datasetId=xxx` - Complete dataset analysis (scores + explanations)
- `/api/score?datasetId=xxx` - Data quality scoring endpoint
- `/api/explain` - GenAI-powered explanations endpoint

**Deterministic Scoring Engine**

- Completeness scoring (null/empty value analysis)
- Accuracy scoring (format errors and invalid values)
- Consistency scoring (format uniformity)
- Timeliness scoring (data freshness)
- Uniqueness scoring (duplicate detection)
- Validity scoring (schema compliance)
- Integrity scoring (referential consistency)

**Frontend Dashboard**

- Composite DQS gauge with animated visualization
- Dimension-wise quality scores (all 7 dimensions)
- Historical trend charts
- GenAI-powered insights (with deterministic fallback)
- Actionable recommendations with severity and impact
- Loading states and error handling
- Responsive design

**Dataset Support**

- Payment Transactions (Sample)
- KYC Customer Records (Sample)
- Settlement & Clearing Data (Sample)

**Compliance & Governance**

- Metadata-only processing (no PII storage)
- Explainable scoring logic
- Audit-ready outputs
- Privacy-first design

🔒 Privacy & Compliance

No real payment data is processed

No transaction records are stored

The MVP operates on mock metadata only

Designed to align with privacy-first and compliance-ready principles

🛠️ Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Recharts (data visualization)
- Radix UI components

**Backend**
- Next.js API Routes
- TypeScript
- Deterministic scoring engine
- OpenAI API integration (GPT-4o-mini) for GenAI explanations
- Fallback to deterministic explanations if API key not provided

**Development**
- Node.js / pnpm
- TypeScript for type safety
- ESLint for code quality

🚀 Getting Started

**Prerequisites**

- Node.js 18+ 
- pnpm (or npm/yarn)

**Installation**

```bash
# Install dependencies
pnpm install

# Set up environment variables (optional for GenAI)
cp .env.example .env
# Add your OPENAI_API_KEY to .env (optional - falls back to deterministic if not provided)

# Run development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

**Environment Variables**

- `OPENAI_API_KEY` (optional): OpenAI API key for GenAI-powered explanations. If not provided, the system uses deterministic explanations.

📡 API Documentation

### GET `/api/dataset?datasetId={datasetId}`

Returns complete dataset analysis including scores, insights, recommendations, and trend data.

**Query Parameters:**
- `datasetId` (required): One of `payment-transactions`, `kyc-records`, or `settlement-data`

**Response:**
```json
{
  "id": "payment-transactions",
  "name": "Payment Transactions – Sample",
  "compositeScore": 78,
  "dimensions": [
    {
      "name": "Completeness",
      "score": 62,
      "status": "Moderate"
    },
    // ... 6 more dimensions
  ],
  "insights": [
    {
      "title": "Completeness Issue",
      "text": "Completeness score is 62/100 (Moderate), indicating potential data quality issues..."
    }
  ],
  "recommendations": [
    {
      "severity": "High",
      "text": "Address completeness issues through validation rules...",
      "impact": "Compliance"
    }
  ],
  "trend": [
    { "date": "Oct", "score": 72 },
    { "date": "Nov", "score": 74 },
    { "date": "Dec", "score": 75 },
    { "date": "Jan", "score": 78 }
  ]
}
```

### GET `/api/score?datasetId={datasetId}`

Returns data quality scores only.

**Query Parameters:**
- `datasetId` (required): Dataset identifier

**Response:**
```json
{
  "id": "payment-transactions",
  "name": "Payment Transactions – Sample",
  "compositeScore": 78,
  "dimensions": [...],
  "metadata": {
    "recordCount": 25000,
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "fieldCount": 9
  }
}
```

### POST `/api/explain`

Generates GenAI-powered explanations for data quality issues.

**Request Body:**
```json
{
  "datasetId": "payment-transactions"
}
```

**Response:**
```json
{
  "insights": [
    {
      "title": "Data Quality Issue",
      "text": "Plain-language explanation of the issue..."
    }
  ],
  "recommendations": [
    {
      "severity": "High",
      "text": "Actionable recommendation...",
      "impact": "Compliance"
    }
  ]
}
```

**Note:** If `OPENAI_API_KEY` is not set, returns deterministic explanations.

🔧 Scoring Logic

The platform uses deterministic, explainable algorithms for all 7 data quality dimensions:

1. **Completeness**: `(non-null values / total values) × 100`
2. **Accuracy**: `(valid values / total values) × 100` (considers format errors + invalid values)
3. **Consistency**: `100 - (format error rate × 100)`
4. **Timeliness**: Age-based scoring (decreases with data age)
5. **Uniqueness**: `(unique values / total values) × 100`
6. **Validity**: `(valid values / total values) × 100` (schema compliance)
7. **Integrity**: Average of Completeness and Uniqueness scores

**Composite Score**: Average of all 7 dimension scores

**Status Thresholds:**
- Good: Score > 80
- Moderate: Score 60-80
- Poor: Score < 60

📌 Disclaimer

This project is a demonstration built for a hackathon context.
All datasets, scores, and explanations use generated metadata and do not represent real payment data.
No sensitive transaction data is stored or processed.

🏁 Conclusion

This platform demonstrates how GenAI-driven data quality intelligence can make payment data:

- **Measurable**: Unified scoring across 7 dimensions
- **Explainable**: GenAI-powered insights in business-friendly language
- **Actionable**: Prioritized recommendations with impact analysis
- **Trustworthy**: Metadata-only processing with audit-ready outputs

It serves as a foundation for building a full-scale, enterprise-ready data quality platform for the payments ecosystem.
