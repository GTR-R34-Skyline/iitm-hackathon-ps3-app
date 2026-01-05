"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, FileText, X, AlertCircle, Loader2 } from "lucide-react"

interface CSVUploadProps {
  onAnalysisComplete: (result: {
    dimensions: {
      completeness: number
      uniqueness: number
      consistency: number
      validity: number
      timeliness?: number
    }
    DQS: number
    metadata?: {
      rowCount: number
      columnCount: number
      columns: string[]
    }
  }) => void
}

export function CSVUpload({ onAnalysisComplete }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError("Please select a valid CSV file.")
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      console.log("Step 1: Uploading and profiling dataset...")
      const formData = new FormData()
      formData.append("file", file)

      // Initial call to process CSV structure and generate a profile
      const datasetRes = await fetch("/api/dataset", {
        method: "POST",
        body: formData,
      })

      if (!datasetRes.ok) {
        const errorText = await datasetRes.text()
        throw new Error(`Upload failed: ${errorText || datasetRes.statusText}`)
      }

      const { profile } = await datasetRes.json()
      console.log("Step 2: Profile generated. Sending to Gemini 2.5 Flash for analysis...")

      // Call the AI analysis route
      // This step typically takes 3-10 seconds
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      })

      if (!analyzeRes.ok) {
        const errorData = await analyzeRes.json()
        console.error("AI Analysis Error:", errorData)
        throw new Error(errorData.details || "AI analysis failed. Please check server logs.")
      }

      const result = await analyzeRes.json()
      console.log("Step 3: Analysis complete! Raw result from API:", result)

      // Calculate DQS as average of all dimensions
      const completeness = Math.round(result.completeness * 100)
      const uniqueness = Math.round(result.uniqueness * 100)
      const consistency = Math.round(result.consistency * 100)
      const validity = Math.round(result.validity * 100)
      const timeliness = result.timeliness ? Math.round(result.timeliness * 100) : undefined

      // Calculate composite DQS as average
      const dqsValues = [completeness, uniqueness, consistency, validity]
      if (timeliness !== undefined) {
        dqsValues.push(timeliness)
      }
      const DQS = Math.round(dqsValues.reduce((a, b) => a + b, 0) / dqsValues.length)

      // Convert decimal values (0.99) to percentages (99) and restructure
      const convertedResult = {
        dimensions: {
          completeness,
          uniqueness,
          consistency,
          validity,
          timeliness,
        },
        DQS,
        metadata: result.metadata,
      }

      console.log("4️⃣ Converted result before callback:", convertedResult)

      // Pass the final result back to the parent Page
      onAnalysisComplete(convertedResult)
      
    } catch (e) {
      console.error("Critical Analysis Error:", e)
      // Display specific fetch or API errors to the user
      setError(e instanceof Error ? e.message : "An unexpected error occurred during analysis.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
  }

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5">
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>
          Upload a CSV file to analyze data quality metrics and get AI-powered insights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <label htmlFor="csv-upload" className="cursor-pointer">
            <input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading}
            />
            <Button type="button" variant="secondary" disabled={loading} asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Select CSV File
              </span>
            </Button>
          </label>

          {file && (
            <div className="flex items-center gap-2 flex-1 p-2 bg-background rounded-md border">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={loading}
                className="ml-auto text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">Analysis Failed</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {file && (
          <Button 
            onClick={handleUpload} 
            disabled={loading} 
            className="w-full relative overflow-hidden"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Dataset...
              </>
            ) : (
              "Analyze Data Quality"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}