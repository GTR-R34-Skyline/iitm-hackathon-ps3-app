/**
 * Sample Metadata Generator
 * 
 * Generates realistic metadata for payment domain datasets
 * This simulates metadata that would come from data profiling tools
 */

import { DatasetMetadata, FieldMetadata } from "./scoring-engine"

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateFieldMetadata(
  name: string,
  totalCount: number,
  type: string,
  options: {
    nullRate?: number
    formatErrorRate?: number
    duplicateRate?: number
    invalidRate?: number
  } = {}
): FieldMetadata {
  const nullCount = Math.floor(totalCount * (options.nullRate || 0))
  const formatErrors = Math.floor(totalCount * (options.formatErrorRate || 0))
  const duplicates = Math.floor(totalCount * (options.duplicateRate || 0))
  const invalidValues = Math.floor(totalCount * (options.invalidRate || 0))

  const nonNullCount = totalCount - nullCount
  const uniqueCount = Math.max(1, nonNullCount - duplicates)

  return {
    name,
    nullCount,
    totalCount,
    uniqueCount,
    type,
    formatErrors: formatErrors > 0 ? formatErrors : undefined,
    duplicates: duplicates > 0 ? duplicates : undefined,
    invalidValues: invalidValues > 0 ? invalidValues : undefined,
  }
}

export function generatePaymentTransactionsMetadata(): DatasetMetadata {
  const recordCount = randomBetween(10000, 50000)
  const now = new Date()
  const lastUpdated = new Date(now.getTime() - randomBetween(1, 48) * 60 * 60 * 1000) // 1-48 hours ago

  return {
    id: "payment-transactions",
    name: "Payment Transactions – Sample",
    recordCount,
    lastUpdated,
    timestamp: now,
    fields: [
      generateFieldMetadata("transaction_id", recordCount, "string", {
        nullRate: 0,
        duplicateRate: 0.02,
      }),
      generateFieldMetadata("merchant_id", recordCount, "string", {
        nullRate: 0.01,
        duplicateRate: 0.15,
      }),
      generateFieldMetadata("amount", recordCount, "decimal", {
        nullRate: 0.005,
        invalidRate: 0.01,
      }),
      generateFieldMetadata("currency", recordCount, "string", {
        nullRate: 0.01,
        formatErrorRate: 0.02,
      }),
      generateFieldMetadata("timestamp", recordCount, "datetime", {
        nullRate: 0.01,
        formatErrorRate: 0.05,
      }),
      generateFieldMetadata("status", recordCount, "string", {
        nullRate: 0.02,
        invalidRate: 0.03,
      }),
      generateFieldMetadata("customer_id", recordCount, "string", {
        nullRate: 0.03,
        duplicateRate: 0.08,
      }),
      generateFieldMetadata("payment_method", recordCount, "string", {
        nullRate: 0.02,
        invalidRate: 0.01,
      }),
      generateFieldMetadata("merchant_address", recordCount, "string", {
        nullRate: 0.15,
        formatErrorRate: 0.08,
      }),
    ],
  }
}

export function generateKYCRecordsMetadata(): DatasetMetadata {
  const recordCount = randomBetween(5000, 20000)
  const now = new Date()
  const lastUpdated = new Date(now.getTime() - randomBetween(6, 72) * 60 * 60 * 1000) // 6-72 hours ago

  return {
    id: "kyc-records",
    name: "KYC Customer Records – Sample",
    recordCount,
    lastUpdated,
    timestamp: now,
    fields: [
      generateFieldMetadata("customer_id", recordCount, "string", {
        nullRate: 0,
        duplicateRate: 0.12,
      }),
      generateFieldMetadata("ssn_tax_id", recordCount, "string", {
        nullRate: 0.05,
        duplicateRate: 0.08,
        formatErrorRate: 0.03,
      }),
      generateFieldMetadata("full_name", recordCount, "string", {
        nullRate: 0.02,
        formatErrorRate: 0.05,
      }),
      generateFieldMetadata("date_of_birth", recordCount, "date", {
        nullRate: 0.03,
        formatErrorRate: 0.04,
        invalidRate: 0.02,
      }),
      generateFieldMetadata("passport_number", recordCount, "string", {
        nullRate: 0.30,
        formatErrorRate: 0.05,
      }),
      generateFieldMetadata("passport_expiry", recordCount, "date", {
        nullRate: 0.30,
        formatErrorRate: 0.06,
        invalidRate: 0.03,
      }),
      generateFieldMetadata("address", recordCount, "string", {
        nullRate: 0.10,
        formatErrorRate: 0.08,
      }),
      generateFieldMetadata("email", recordCount, "string", {
        nullRate: 0.05,
        formatErrorRate: 0.10,
        invalidRate: 0.05,
      }),
      generateFieldMetadata("phone", recordCount, "string", {
        nullRate: 0.08,
        formatErrorRate: 0.12,
      }),
      generateFieldMetadata("verification_status", recordCount, "string", {
        nullRate: 0.02,
        invalidRate: 0.02,
      }),
    ],
  }
}

export function generateSettlementDataMetadata(): DatasetMetadata {
  const recordCount = randomBetween(1000, 5000)
  const now = new Date()
  const lastUpdated = new Date(now.getTime() - randomBetween(0.5, 6) * 60 * 60 * 1000) // 0.5-6 hours ago

  return {
    id: "settlement-data",
    name: "Settlement & Clearing Data – Sample",
    recordCount,
    lastUpdated,
    timestamp: now,
    fields: [
      generateFieldMetadata("settlement_id", recordCount, "string", {
        nullRate: 0,
        duplicateRate: 0,
      }),
      generateFieldMetadata("transaction_reference", recordCount, "string", {
        nullRate: 0,
        duplicateRate: 0.001,
      }),
      generateFieldMetadata("clearing_house_code", recordCount, "string", {
        nullRate: 0,
        formatErrorRate: 0.001,
      }),
      generateFieldMetadata("settlement_amount", recordCount, "decimal", {
        nullRate: 0,
        invalidRate: 0.001,
      }),
      generateFieldMetadata("settlement_date", recordCount, "date", {
        nullRate: 0,
        formatErrorRate: 0.002,
      }),
      generateFieldMetadata("status_code", recordCount, "string", {
        nullRate: 0,
        invalidRate: 0.001,
      }),
      generateFieldMetadata("bank_account", recordCount, "string", {
        nullRate: 0.005,
        formatErrorRate: 0.003,
      }),
      generateFieldMetadata("routing_number", recordCount, "string", {
        nullRate: 0.005,
        formatErrorRate: 0.002,
      }),
    ],
  }
}

export function generateMetadataForDataset(datasetId: string): DatasetMetadata {
  switch (datasetId) {
    case "payment-transactions":
      return generatePaymentTransactionsMetadata()
    case "kyc-records":
      return generateKYCRecordsMetadata()
    case "settlement-data":
      return generateSettlementDataMetadata()
    default:
      throw new Error(`Unknown dataset ID: ${datasetId}`)
  }
}

