export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getLastProfile } from "@/app/api/dataset/route"

export async function POST() {
  try {
    const profile = getLastProfile()

    if (!profile) {
      return NextResponse.json(
        { error: "No dataset uploaded yet" },
        { status: 400 }
      )
    }

    const response = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      {
        error: "Scoring failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}
