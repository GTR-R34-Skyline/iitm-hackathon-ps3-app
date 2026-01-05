import Papa from "papaparse"

export interface ColumnProfile {
  name: string
  nullCount: number
  uniqueCount: number
  totalCount: number
  sampleValues: string[]
}

export interface DatasetProfile {
  rowCount: number
  columnCount: number
  columns: ColumnProfile[]
}

export async function profileCSV(file: File): Promise<DatasetProfile> {
  const text = await file.text()

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    throw new Error("CSV parsing failed")
  }

  const rows = parsed.data
  const headers = Object.keys(rows[0] || {})
  const rowCount = rows.length

  const columns: ColumnProfile[] = headers.map((col) => {
    const values = rows.map((r) => r[col])
    const nonEmpty = values.filter(
      (v) => v !== undefined && v !== null && v !== "" && v !== "NA"
    )

    return {
      name: col,
      totalCount: rowCount,
      nullCount: rowCount - nonEmpty.length,
      uniqueCount: new Set(nonEmpty).size,
      sampleValues: nonEmpty.slice(0, 5),
    }
  })

  return {
    rowCount,
    columnCount: headers.length,
    columns,
  }
}
