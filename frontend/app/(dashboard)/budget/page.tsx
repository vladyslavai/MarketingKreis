"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useBudgetData } from "@/hooks/use-budget-data"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from "recharts"
import { DollarSign, Handshake, Target, RefreshCw, Wallet } from "lucide-react"

export default function BudgetPage() {
  const { budgetData, loading, error, refetch } = useBudgetData()

  if (loading || !budgetData) {
    return (
      <div className="p-8 space-y-6">
        <Card className="glass-card"><CardHeader><CardTitle className="text-white">Budget & KPIs</CardTitle></CardHeader><CardContent><p className="text-slate-300">Laden...</p></CardContent></Card>
      </div>
    )
  }

  const colors: Record<string, string> = {
    VERKAUFSFOERDERUNG: '#3b82f6',
    IMAGE: '#ef4444',
    EMPLOYER_BRANDING: '#10b981',
    KUNDENPFLEGE: '#f59e0b',
  }

  const chf = (v: number) => `CHF ${Math.round(v).toLocaleString()}`

  // Micro sparkline for KPI cards
  const Sparkline = ({ series, stroke, from, to }: { series: number[]; stroke: string; from: string; to: string }) => {
    if (!series || series.length === 0) return null
    const n = series.length
    const max = Math.max(...series, 1)
    const min = Math.min(...series, 0)
    const w = 120
    const h = 28
    const toPoint = (v: number, i: number) => {
      const t = max === min ? 0.5 : (v - min) / (max - min)
      const x = (i / (n - 1)) * w
      const y = h - 6 - t * (h - 10)
      return { x, y }
    }
    const pts = series.map(toPoint)
    const d = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ")
    const area = `M 0 ${h} L ${pts.map(p=>`${p.x} ${p.y}`).join(' L ')} L ${w} ${h} Z`
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7">
        <defs>
          <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} stopOpacity="0.35" />
            <stop offset="100%" stopColor={to} stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#kpiGrad)" />
        <path d={d} stroke={stroke} strokeWidth="2" fill="none" />
      </svg>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-tr from-fuchsia-500/30 to-blue-500/30 blur-3xl animate-gradient-shift" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-500/30 to-emerald-500/30 blur-3xl animate-gradient-shift" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-kaboom-red/30 to-blue-500/30 flex items-center justify-center border border-white/20 shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">Budget & KPIs</h1>
              <p className="text-slate-300 text-sm">Ziele, Verlauf und Verteilung über Kategorien</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="glass-card" onClick={refetch}><RefreshCw className="h-4 w-4 mr-2" /> Aktualisieren</Button>
            <Button variant="outline" className="glass-card" onClick={()=> alert('Bearbeitung der Ziele – kommt bald')}>Ziele bearbeiten</Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {budgetData.kpiTargets.map(kpi => {
          const Icon = kpi.id === "revenue" ? DollarSign : kpi.id === "deals" ? Handshake : Target
          const series = kpi.id === "revenue" ? budgetData.monthlyData.map(m=>m.actual) : kpi.id === "deals" ? budgetData.monthlyData.map(m=>m.planned) : budgetData.monthlyData.map(m=>m.forecast)
        return (
          <Card key={kpi.id} className="glass-card p-6 group overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-300">{kpi.metric}</p>
                  <p className="text-2xl font-bold text-white">{kpi.unit === 'CHF' ? chf(kpi.current) : `${Math.round(kpi.current)} ${kpi.unit}`}</p>
                  <p className={`text-[11px] ${kpi.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%</p>
                  <p className="text-xs text-slate-400">Ziel: {kpi.unit === 'CHF' ? chf(kpi.target) : `${Math.round(kpi.target)} ${kpi.unit}`}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-3 -mx-2">
                <Sparkline series={series} stroke="#93c5fd" from="#93c5fd" to="#1e3a8a" />
              </div>
            </CardContent>
          </Card>
        )})}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-white">Revenue & Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={budgetData.monthlyData}>
                  <CartesianGrid stroke="rgba(148, 163, 184, .15)" vertical={false} />
                  <XAxis dataKey="month" stroke="transparent" tick={{ fill: "#a3b1c6" }} axisLine={false} tickLine={false} style={{ fontSize: 12, fontWeight: 500 }} />
                  <YAxis stroke="transparent" tick={{ fill: "#a3b1c6" }} axisLine={false} tickLine={false} style={{ fontSize: 12, fontWeight: 500 }} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "none", borderRadius: 12, color: "#1e293b", backdropFilter: "blur(10px)" }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#a3b1c6" }} />
                  <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeWidth={2} name="Planned" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={3} strokeDasharray="8 4" name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Categories pie */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Verteilung nach Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetData.categoryData} dataKey="value" nameKey="category" innerRadius={65} outerRadius={100} paddingAngle={3} stroke="#0f172a" labelLine={false}>
                    {budgetData.categoryData.map((entry, idx) => (
                      <Cell key={idx} fill={colors[entry.category] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "none", borderRadius: 12, color: "#1e293b", backdropFilter: "blur(10px)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {budgetData.categoryData.map(c => (
                <div key={c.category} className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[c.category] || '#64748b' }} />
                  {c.category} ({Math.round(c.value).toLocaleString()} CHF)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement bars */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Planerfüllung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData.achievementData}>
                <CartesianGrid stroke="rgba(148, 163, 184, .15)" vertical={false} />
                <XAxis dataKey="category" stroke="transparent" tick={{ fill: "#a3b1c6" }} axisLine={false} tickLine={false} style={{ fontSize: 12, fontWeight: 500 }} />
                <YAxis stroke="transparent" tick={{ fill: "#a3b1c6" }} axisLine={false} tickLine={false} style={{ fontSize: 12, fontWeight: 500 }} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "none", borderRadius: 12, color: "#1e293b", backdropFilter: "blur(10px)" }} />
                <Bar dataKey="achievement" fill="#10b981" name="%" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" className="glass-card" onClick={refetch}><RefreshCw className="h-4 w-4 mr-2" /> Aktualisieren</Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-xs text-amber-300">Hinweis: {error}</p>
      )}
    </div>
  )
}


