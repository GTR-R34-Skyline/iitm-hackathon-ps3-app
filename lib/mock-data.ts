export type DataDimension = {
  name: string
  score: number
  status: "Good" | "Moderate" | "Poor"
}

export type Dataset = {
  id: string
  name: string
  compositeScore: number
  dimensions: DataDimension[]
  insights: { title: string; text: string }[]
  recommendations: { severity: "High" | "Medium" | "Low"; text: string; impact: string }[]
  trend: { date: string; score: number }[]
}

export const MOCK_DATASETS: Record<string, Dataset> = {
  "payment-transactions": {
    id: "payment-transactions",
    name: "Payment Transactions – Sample",
    compositeScore: 78,
    dimensions: [
      { name: "Completeness", score: 62, status: "Moderate" },
      { name: "Accuracy", score: 81, status: "Good" },
      { name: "Consistency", score: 74, status: "Moderate" },
      { name: "Timeliness", score: 88, status: "Good" },
      { name: "Uniqueness", score: 91, status: "Good" },
      { name: "Validity", score: 70, status: "Moderate" },
      { name: "Integrity", score: 85, status: "Good" },
    ],
    insights: [
      { title: "Completeness", text: "Address fields in merchant metadata show 15% null values." },
      { title: "Consistency", text: "ISO-8601 date formatting is inconsistent across secondary legacy pipelines." },
    ],
    recommendations: [
      { severity: "High", text: "Standardize address fields across KYC sources.", impact: "Compliance" },
      { severity: "Medium", text: "Enforce date format validation in transaction pipelines.", impact: "Operations" },
      { severity: "Low", text: "Deduplicate customer identifiers.", impact: "Analytics" },
    ],
    trend: [
      { date: "Oct", score: 72 },
      { date: "Nov", score: 74 },
      { date: "Dec", score: 75 },
      { date: "Jan", score: 78 },
    ],
  },
  "kyc-records": {
    id: "kyc-records",
    name: "KYC Customer Records – Sample",
    compositeScore: 64,
    dimensions: [
      { name: "Completeness", score: 45, status: "Poor" },
      { name: "Accuracy", score: 72, status: "Moderate" },
      { name: "Consistency", score: 68, status: "Moderate" },
      { name: "Timeliness", score: 95, status: "Good" },
      { name: "Uniqueness", score: 55, status: "Poor" },
      { name: "Validity", score: 62, status: "Moderate" },
      { name: "Integrity", score: 82, status: "Good" },
    ],
    insights: [
      { title: "Completeness", text: "Passport expiry dates are missing for 30% of non-resident records." },
      { title: "Uniqueness", text: "Detected multiple profiles sharing identical SSN/Tax IDs." },
    ],
    recommendations: [
      { severity: "High", text: "Implement mandatory field validation for identity documents.", impact: "Compliance" },
      { severity: "Medium", text: "Run de-duplication script on historical CRM data.", impact: "Analytics" },
    ],
    trend: [
      { date: "Oct", score: 58 },
      { date: "Nov", score: 60 },
      { date: "Dec", score: 62 },
      { date: "Jan", score: 64 },
    ],
  },
  "settlement-data": {
    id: "settlement-data",
    name: "Settlement & Clearing Data – Sample",
    compositeScore: 92,
    dimensions: [
      { name: "Completeness", score: 95, status: "Good" },
      { name: "Accuracy", score: 94, status: "Good" },
      { name: "Consistency", score: 90, status: "Good" },
      { name: "Timeliness", score: 98, status: "Good" },
      { name: "Uniqueness", score: 99, status: "Good" },
      { name: "Validity", score: 88, status: "Good" },
      { name: "Integrity", score: 92, status: "Good" },
    ],
    insights: [
      { title: "Accuracy", text: "Clearing house response codes are 99.9% accurate." },
      { title: "Timeliness", text: "Settlement window latency is within optimal bounds." },
    ],
    recommendations: [{ severity: "Low", text: "Archive clearing logs older than 24 months.", impact: "Operations" }],
    trend: [
      { date: "Oct", score: 88 },
      { date: "Nov", score: 90 },
      { date: "Dec", score: 91 },
      { date: "Jan", score: 92 },
    ],
  },
}

export const getRandomizedDataset = (baseDataset: Dataset): Dataset => {
  const variance = () => Math.floor(Math.random() * 11) - 5 // +/- 5

  const randomizedDimensions = baseDataset.dimensions.map((dim) => {
    const newScore = Math.max(0, Math.min(100, dim.score + variance()))
    return {
      ...dim,
      score: newScore,
      status: newScore > 80 ? "Good" : newScore > 60 ? "Moderate" : "Poor",
    } as DataDimension
  })

  const newCompositeScore = Math.round(
    randomizedDimensions.reduce((acc, curr) => acc + curr.score, 0) / randomizedDimensions.length,
  )

  return {
    ...baseDataset,
    compositeScore: newCompositeScore,
    dimensions: randomizedDimensions,
  }
}
