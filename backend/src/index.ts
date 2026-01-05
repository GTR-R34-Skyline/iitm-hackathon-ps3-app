/**
 * Data Quality Scoring Platform Backend
 * Express server with CSV analysis and LLM-powered explanations
 */

import express, { Request, Response } from "express"
import multer from "multer"
import { parse } from "csv-parse/sync"
import cors from "cors"
import dotenv from "dotenv"
import { computeScores, calculateDQS, prepareMetadata, CSVRow } from "./scoring-engine"
import { generateExplanation } from "./genai-explanation"
import { AnalysisResult, ExplanationRequest, ErrorResponse } from "./types"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true)
    } else {
      cb(new Error("Only CSV files are allowed"))
    }
  },
})

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "data-quality-backend",
  })
})

/**
 * POST /analyze
 * Accept CSV file and compute data quality scores
 */
app.post("/analyze", upload.single("file"), (req: Request, res: Response<AnalysisResult | ErrorResponse>) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: "Bad Request",
        message: "No file uploaded. Please upload a CSV file using the 'file' field.",
      })
    }

    // Parse CSV
    let rows: CSVRow[]
    try {
      const csvContent = req.file.buffer.toString("utf-8")
      const parsed = parse(csvContent, {
        columns: true, // Use first row as column names
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
      })

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return res.status(400).json({
          error: "Invalid CSV",
          message: "CSV file is empty or could not be parsed.",
        })
      }

      rows = parsed as CSVRow[]
    } catch (parseError) {
      return res.status(400).json({
        error: "CSV Parse Error",
        message: `Failed to parse CSV file: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      })
    }

    // Prepare metadata (metadata-only, no raw data stored)
    const metadata = prepareMetadata(rows)
    // Compute scores (rows passed directly, not stored in metadata)
    const dimensions = computeScores(rows, metadata)
    const DQS = calculateDQS(dimensions)
    
    // Clear rows from memory after scoring (rows variable goes out of scope)

    // Return analysis result
    const result: AnalysisResult = {
      dimensions,
      DQS,
      metadata: {
        rowCount: metadata.rowCount,
        columnCount: metadata.columnCount,
        columns: metadata.columns,
      },
    }

    res.json(result)
  } catch (error) {
    console.error("Analysis error:", error)
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "An unexpected error occurred during analysis.",
    })
  }
})

/**
 * POST /explain
 * Generate LLM-powered explanation and recommendations
 */
app.post("/explain", async (req: Request, res: Response) => {
  try {
    const body = req.body as ExplanationRequest

    // Validate request body
    if (!body.dimensions || typeof body.DQS !== "number") {
      return res.status(400).json({
        error: "Bad Request",
        message: "Request body must include 'dimensions' object and 'DQS' number.",
      })
    }

    const { dimensions, DQS } = body

    // Validate dimensions structure
    if (
      typeof dimensions.completeness !== "number" ||
      typeof dimensions.uniqueness !== "number" ||
      typeof dimensions.consistency !== "number" ||
      typeof dimensions.validity !== "number"
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Dimensions must include completeness, uniqueness, consistency, and validity as numbers.",
      })
    }

    // Validate score ranges
    const allScores = [
      dimensions.completeness,
      dimensions.uniqueness,
      dimensions.consistency,
      dimensions.validity,
      dimensions.timeliness,
    ].filter((s) => s !== undefined) as number[]

    if (allScores.some((score) => score < 0 || score > 100)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "All scores must be between 0 and 100.",
      })
    }

    // Generate explanation (only scores and metadata, no raw data)
    // Note: metadata is optional and not included in ExplanationRequest
    const explanation = await generateExplanation(dimensions, DQS)

    res.json(explanation)
  } catch (error) {
    console.error("Explanation error:", error)
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "An unexpected error occurred while generating explanation.",
    })
  }
})

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: "Endpoint not found. Available endpoints: GET /health, POST /analyze, POST /explain",
  })
})

// Error handler
app.use((error: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", error)
  res.status(500).json({
    error: "Internal Server Error",
    message: error.message || "An unexpected error occurred",
  })
})

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Data Quality Backend server running on http://localhost:${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/health`)
    console.log(`🔍 Gemini API key: ${process.env.GEMINI_API_KEY ? "✓ Configured" : "✗ Not configured (using deterministic fallback)"}`)
  })
}

export default app

