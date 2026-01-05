"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import {
  Activity,
  CheckCircle2,
  Info,
  ShieldCheck,
  ArrowUpRight,
  LayoutDashboard,
  Database,
  FileText,
  Settings,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCountAnimation } from "@/hooks/use-count-animation"

type Dataset = {
  id: string
  name: string
  compositeScore: number
  dimensions: Array<{ name: string; score: number; status: "Good" | "Moderate" | "Poor" }>
  insights: Array<{ title: string; text: string }>
  recommendations: Array<{ severity: "High" | "Medium" | "Low"; text: string; impact: string }>
  trend: Array<{ date: string; score: number }>
}

const DATASET_OPTIONS = [
  { id: "payment-transactions", name: "Payment Transactions – Sample" },
  { id: "kyc-records", name: "KYC Customer Records – Sample" },
  { id: "settlement-data", name: "Settlement & Clearing Data – Sample" },
]

function AnimatedScore({ value, className }: { value: number; className?: string }) {
  const { count, ref } = useCountAnimation(value)
  return (
    <span ref={ref} className={className}>
      {count}
    </span>
  )
}

export function DashboardShell() {
  const [selectedId, setSelectedId] = useState<string>("payment-transactions")
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDataset = async (datasetId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/dataset?datasetId=${encodeURIComponent(datasetId)}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`)
      }
      const data = await response.json()
      setDataset(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dataset")
      console.error("Error fetching dataset:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDataset(selectedId)
  }, [selectedId])

  const handleRefresh = () => {
    fetchDataset(selectedId)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Inspired by Vercel/Supabase Sidebar */}
      <aside className="w-64 border-r border-border hidden md:flex flex-col p-4 gap-6 bg-card/30 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold italic">
            DQ
          </div>
          <span className="font-bold tracking-tight text-xl">BRAINTRUST</span>
        </div>

        <nav className="flex flex-col gap-1">
          <Button variant="ghost" className="justify-start gap-2 bg-accent/50">
            <LayoutDashboard className="h-4 w-4" />
            Observability
          </Button>
          <Button variant="ghost" className="justify-start gap-2 text-muted-foreground">
            <Database className="h-4 w-4" />
            Datasets
          </Button>
          <Button variant="ghost" className="justify-start gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Governance
          </Button>
          <Button variant="ghost" className="justify-start gap-2 text-muted-foreground">
            <Settings className="h-4 w-4" />
            Configuration
          </Button>
        </nav>

        <div className="mt-auto pt-4 border-t border-border">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-2">Compliance Ready</p>
              <div className="flex flex-col gap-1.5">
                {["Metadata only", "Audit-ready"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[10px]">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background/50 relative">
        {/* Background Glow - Inspired by Braintrust Hero */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedId} onValueChange={setSelectedId} disabled={loading}>
              <SelectTrigger className="w-[280px] bg-card/50 border-border">
                <SelectValue placeholder="Select Dataset" />
              </SelectTrigger>
              <SelectContent>
                {DATASET_OPTIONS.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    {ds.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
              MVP Demo
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Docs
            </Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh Score"
              )}
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-7xl mx-auto">
          {error && (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-4">
                <p className="text-sm text-destructive">Error: {error}</p>
              </CardContent>
            </Card>
          )}
          
          {loading && !dataset && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {!loading && !error && dataset && (
            <>
          {/* Hero Section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-balance">Universal Data Quality Intelligence</h1>
            <p className="text-muted-foreground text-lg">
              A GenAI-driven system for measuring and explaining payment data dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Composite Score Gauge */}
            <Card className="lg:col-span-1 bg-card/50 border-border backdrop-blur-sm overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Composite DQS
                </CardTitle>
                <CardDescription>Overall quality across all dimensions</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-8">
                <div className="relative h-48 w-48 flex items-center justify-center">
                  {/* Simplified SVG Gauge */}
                  <svg className="h-full w-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-border"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 80}
                      strokeDashoffset={2 * Math.PI * 80 * (1 - dataset.compositeScore / 100)}
                      className="text-primary transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <AnimatedScore value={dataset.compositeScore} className="text-5xl font-bold tracking-tighter" />
                    <span className="text-xs font-medium text-muted-foreground uppercase">/ 100</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm">
                  <Badge
                    className={cn(
                      dataset.compositeScore > 80
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : dataset.compositeScore > 60
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20",
                    )}
                  >
                    {dataset.compositeScore > 80 ? "Optimal" : dataset.compositeScore > 60 ? "Acceptable" : "Critical"}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> 2.4% vs last scan
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Trends Chart */}
            <Card className="lg:col-span-2 bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Historical Trend
                  </CardTitle>
                  <CardDescription>Illustrative monitoring for governance</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  4 Months
                </Badge>
              </CardHeader>
              <CardContent className="h-[250px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dataset.trend}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "var(--primary)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="var(--primary)"
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Dimension Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Dimension Analysis</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {dataset.dimensions.map((dim) => (
                <Card key={dim.name} className="bg-card/40 border-border hover:bg-card transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                      {dim.name}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <AnimatedScore value={dim.score} className="text-2xl font-bold" />
                      <span className="text-[10px] text-muted-foreground">/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          dim.status === "Good"
                            ? "bg-emerald-500"
                            : dim.status === "Moderate"
                              ? "bg-amber-500"
                              : "bg-destructive",
                        )}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1 py-0 h-4 border-transparent bg-background/50",
                        dim.status === "Good"
                          ? "text-emerald-500"
                          : dim.status === "Moderate"
                            ? "text-amber-500"
                            : "text-destructive",
                      )}
                    >
                      {dim.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Insights Section */}
            <Card className="bg-primary/5 border-primary/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Activity className="h-24 w-24 text-primary" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary text-primary-foreground">
                    <Activity className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
                </div>
                <CardDescription>Plain-language explanation of data anomalies (Simulated)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataset.insights.map((insight, i) => (
                  <div key={i} className="p-3 rounded-lg bg-card/60 border border-border flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{insight.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-primary/60 font-medium italic">
                  Note: These insights are generated based on metadata patterns and scoring logic.
                </p>
              </CardContent>
            </Card>

            {/* Recommendations Section */}
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-accent text-accent-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg">Actionable Recommendations</CardTitle>
                </div>
                <CardDescription>Prioritized fixes with impact areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataset.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors border border-transparent hover:border-border"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-0.5 uppercase text-[10px] h-5 shrink-0",
                        rec.severity === "High"
                          ? "border-destructive/50 text-destructive"
                          : rec.severity === "Medium"
                            ? "border-amber-500/50 text-amber-500"
                            : "border-emerald-500/50 text-emerald-500",
                      )}
                    >
                      {rec.severity}
                    </Badge>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-tight">{rec.text}</p>
                      <p className="text-xs text-muted-foreground">
                        Impact: <span className="text-foreground">{rec.impact}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Compliance Panel */}
          <footer className="pt-8 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-2">
                <h3 className="font-bold tracking-tight text-sm uppercase text-muted-foreground">Compliance & Audit</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real-time validation indicators for enterprise governance standards.
                </p>
              </div>
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Metadata-only processing", icon: ShieldCheck },
                  { label: "No PII storage", icon: ShieldCheck },
                  { label: "Explainable logic", icon: Info },
                  { label: "Audit-ready logs", icon: CheckCircle2 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium">
                    <item.icon className="h-4 w-4 text-primary shrink-0" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 text-center border-t border-border pt-4">
              <p className="text-[10px] text-muted-foreground italic">
                Disclaimer: This demo uses static metadata only. No real payment or transaction data is processed.
              </p>
            </div>
          </footer>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
