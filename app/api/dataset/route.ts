export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import Papa from "papaparse"
import { buildDatasetProfile } from "@/lib/ai-profile"

let LAST_PROFILE: any = null

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV required" }, { status: 400 })
    }

    const text = await file.text()

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (parsed.errors.length) {
      throw new Error("CSV parsing failed")
    }

    const profile = buildDatasetProfile(parsed.data as any[], parsed.meta.fields!)

    LAST_PROFILE = profile

    return NextResponse.json({
      datasetId: "live-csv",
      profile,
    })
  } catch (err) {
    return NextResponse.json(
      {
        error: "Dataset upload failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}

export function getLastProfile() {
  return LAST_PROFILE
}
