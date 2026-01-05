import Papa from "papaparse"
import { DatasetMetadata, FieldMetadata } from "./scoring-engine"

export async function generateMetadataFromCSV(file: File): Promise<DatasetMetadata> {
  const text = await file.text()

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length) {
    throw new Error("CSV parsing failed")
  }

  const rows = parsed.data
  if (!rows.length) {
    throw new Error("CSV contains no data")
  }

  const columns = Object.keys(rows[0])
  const recordCount = rows.length

  const fields: FieldMetadata[] = columns.map((col) => {
    const values = rows.map((r) => r[col])

    const nullCount = values.filter(
      (v) => v === "" || v === null || v === undefined
    ).length

    const uniqueCount = new Set(values.filter(v => v !== "" && v != null)).size

    return {
      name: col,
      totalCount: recordCount,
      nullCount,
      uniqueCount,
      type: inferType(values),
    }
  })

  return {
    id: crypto.randomUUID(),
    name: "Uploaded CSV Dataset",
    recordCount,
    fields,
    timestamp: new Date(),
    lastUpdated: new Date(),
  }
}

function inferType(values: string[]): string {
  if (values.every(v => v !== "" && !isNaN(Number(v)))) return "number"
  if (values.every(v => v && !isNaN(Date.parse(v)))) return "date"
  return "string"
}
