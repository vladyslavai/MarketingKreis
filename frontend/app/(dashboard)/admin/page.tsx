"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useJobsApi } from "@/hooks/use-uploads-api"
import { userCategoriesAPI, apiBase, crmAPI, companiesAPI, contactsAPI, dealsAPI } from "@/lib/api"
import { Shield, Server, Settings, PlayCircle, RefreshCw, Database, Wrench, Flag, Info, Users, Briefcase, Contact2, Tag, Plus, FlaskConical, PanelLeft, Bug, Bot, Globe, Clock3, Monitor, Sun, Moon, Wifi, Grid3X3, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function AdminPage() {
  const { jobs, isLoading: jobsLoading, refresh: refreshJobs } = useJobsApi()
  const [activeTab, setActiveTab] = React.useState("overview")
  const [categoriesCount, setCategoriesCount] = React.useState<number>(0)
  const [health, setHealth] = React.useState<null | { status?: string }>(null)
  const [checking, setChecking] = React.useState(false)
  const [stats, setStats] = React.useState<{ companies?: number; contacts?: number; deals?: number } | null>(null)
  const [series, setSeries] = React.useState<{ companies: number[]; contacts: number[]; deals: number[] }>({ companies: [], contacts: [], deals: [] })
  const [seriesDates, setSeriesDates] = React.useState<string[]>([])
  const [chartMode, setChartMode] = React.useState<'bars' | 'area'>('bars')
  const [categories, setCategories] = React.useState<{ name: string; color: string }[]>([])
  const [savingCats, setSavingCats] = React.useState(false)
  const [flags, setFlags] = React.useState<Record<string, boolean>>({})
  const [viewport, setViewport] = React.useState<{ w: number; h: number; dpr: number; online: boolean }>({ w: 0, h: 0, dpr: 1, online: true })
  const prefersDark = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false

  // Tiny reusable micro charts for the overview cards
  function MicroBars({ data, dates, stroke, from, to }: { data: number[]; dates: string[]; stroke: string; from: string; to: string }) {
    const gid = React.useId()
    if (!data || data.length === 0) return null
    const n = data.length
    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const w = 100
    const h = 24
    const barW = (w / n)
    const [hi, setHi] = React.useState<number | null>(null)
    const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = (e.target as SVGElement).closest('svg')!
      const rect = svg.getBoundingClientRect()
      const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width)
      const i = Math.round((x / rect.width) * (n - 1))
      setHi(i)
    }
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full h-6 opacity-90" onMouseMove={onMove} onMouseLeave={()=>setHi(null)}>
        <defs>
          <linearGradient id={`g-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} stopOpacity="0.9" />
            <stop offset="100%" stopColor={to} stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {data.map((v, i) => {
          const t = max === min ? 0.5 : (v - min) / (max - min)
          const bh = 4 + t * (h - 6)
          const x = i * barW + 0.5
          const y = h - bh
          return (
            <rect key={i} x={x} y={y} width={Math.max(1.5, barW - 1)} height={bh} rx="1.5" fill={`url(#g-${gid})`} stroke={stroke} strokeOpacity="0.25">
              <title>{v}</title>
            </rect>
          )
        })}
        {hi !== null && hi >= 0 && hi < n && (
          <>
            <line x1={(hi/(n-1))*w} x2={(hi/(n-1))*w} y1="1" y2={h-1} stroke={stroke} strokeOpacity="0.4" />
            <rect x={Math.min(w-46, Math.max(0, (hi/(n-1))*w - 22))} y="1" width="46" height="12" rx="3" fill="rgba(15,23,42,.9)" stroke="rgba(255,255,255,.15)" />
            <text x={Math.min(w-46, Math.max(0, (hi/(n-1))*w - 22)) + 4} y="10" fill="#cbd5e1" fontSize="7">{(dates[hi]||'').slice(5)} • {data[hi]}</text>
          </>
        )}
      </svg>
    )
  }
  function MicroArea({ data, dates, stroke, from, to }: { data: number[]; dates: string[]; stroke: string; from: string; to: string }) {
    if (!data || data.length === 0) return null
    const n = data.length
    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const w = 100
    const h = 24
    const toPoint = (v: number, i: number) => {
      const t = max === min ? 0.5 : (v - min) / (max - min)
      const x = (i / (n - 1)) * w
      const y = 18 - t * 12
      return { x, y }
    }
    const pts = data.map(toPoint)
    const d = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
    const area = `M 0 ${h} L ${pts.map(p=>`${p.x} ${p.y}`).join(' L ')} L ${w} ${h} Z`
    const [hi, setHi] = React.useState<number | null>(null)
    const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = (e.target as SVGElement).closest('svg')!
      const rect = svg.getBoundingClientRect()
      const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width)
      const i = Math.round((x / rect.width) * (n - 1))
      setHi(i)
    }
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full h-6 opacity-90" onMouseMove={onMove} onMouseLeave={()=>setHi(null)}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} stopOpacity="0.35" />
            <stop offset="100%" stopColor={to} stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)" />
        <path d={d} fill="none" stroke={stroke} strokeWidth="2" />
        {hi !== null && hi >= 0 && hi < n && (
          <>
            <line x1={pts[hi].x} x2={pts[hi].x} y1="1" y2={h-1} stroke={stroke} strokeOpacity="0.4" />
            <circle cx={pts[hi].x} cy={pts[hi].y} r="2" fill={stroke} />
            <rect x={Math.min(w-50, Math.max(0, pts[hi].x - 24))} y="1" width="50" height="12" rx="3" fill="rgba(15,23,42,.9)" stroke="rgba(255,255,255,.15)" />
            <text x={Math.min(w-50, Math.max(0, pts[hi].x - 24)) + 4} y="10" fill="#cbd5e1" fontSize="7">{(dates[hi]||'').slice(5)} • {data[hi]}</text>
          </>
        )}
      </svg>
    )
  }

  React.useEffect(() => {
    userCategoriesAPI.get().then((cats) => {
      setCategories(cats || [])
      setCategoriesCount((cats || []).length)
    }).catch(() => {
      setCategories([])
      setCategoriesCount(0)
    })
    // Load CRM counts + build simple weekly series for sparklines
    const buildBuckets = (items: any[], getDate: (x: any) => string | Date | undefined) => {
      const buckets: number[] = new Array(20).fill(0)
      const labels: string[] = new Array(20).fill("")
      const now = Date.now()
      const weekMs = 7 * 24 * 3600 * 1000
      for (let i = 0; i < 20; i++) {
        labels[i] = new Date(now - (19 - i) * weekMs).toISOString().slice(0, 10)
      }
      items.forEach((it) => {
        const d = getDate(it) ? new Date(getDate(it) as any).getTime() : NaN
        if (isNaN(d)) return
        const diff = Math.max(0, now - d)
        const idxFromNow = Math.floor(diff / weekMs)
        const bucket = 19 - Math.min(19, idxFromNow)
        if (bucket >= 0 && bucket < 20) buckets[bucket] += 1
      })
      return { buckets, labels }
    }
    Promise.all([
      companiesAPI.getAll().catch(()=>[] as any[]),
      contactsAPI.getAll().catch(()=>[] as any[]),
      dealsAPI.getAll().catch(()=>[] as any[]),
      crmAPI.getStats().catch(()=>({} as any)),
    ]).then(([companies, contacts, deals, s]) => {
      setStats({
        companies: typeof s?.totalCompanies === 'number' ? s.totalCompanies : (companies?.length || 0),
        contacts: typeof s?.totalContacts === 'number' ? s.totalContacts : (contacts?.length || 0),
        deals: typeof s?.totalDeals === 'number' ? s.totalDeals : (deals?.length || 0),
      })
      const c = buildBuckets(companies || [], (x)=> (x?.created_at || x?.createdAt))
      const ct = buildBuckets(contacts || [], (x)=> (x?.created_at || x?.createdAt))
      const dls = buildBuckets(deals || [], (x)=> (x?.created_at || x?.createdAt))
      setSeries({
        companies: c.buckets,
        contacts: ct.buckets,
        deals: dls.buckets,
      })
      setSeriesDates(c.labels)
    }).catch(()=> {
      setStats({ companies: 0, contacts: 0, deals: 0 })
      setSeries({ companies: [], contacts: [], deals: [] })
      setSeriesDates([])
    })
    try {
      const stored = JSON.parse(localStorage.getItem("featureFlags") || "{}")
      setFlags(stored || {})
    } catch { setFlags({}) }
  }, [])

  React.useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return
      setViewport({ w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1, online: navigator.onLine })
    }
    update()
    window.addEventListener("resize", update)
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  const checkHealth = async () => {
    setChecking(true)
    try {
      const res = await fetch(`${apiBase}/health`, { credentials: "include" })
      const j = await res.json().catch(() => ({}))
      setHealth(j || { status: res.ok ? "ok" : "error" })
    } catch {
      setHealth({ status: "error" })
    } finally {
      setChecking(false)
    }
  }

  const jobsSummary = React.useMemo(() => {
    const total = jobs.length
    const by = (s: string) => jobs.filter((j) => j.status === (s as any)).length
    return {
      total,
      queued: by("queued"),
      processing: by("processing"),
      completed: by("completed"),
      failed: by("failed"),
    }
  }, [jobs])

  const addCategory = () => {
    setCategories(prev => [...prev, { name: "", color: "#3b82f6" }])
  }
  const updateCategory = (idx: number, key: "name" | "color", value: string) => {
    setCategories(prev => prev.map((c, i) => i === idx ? { ...c, [key]: value } : c))
  }
  const removeCategory = (idx: number) => {
    setCategories(prev => prev.filter((_, i) => i !== idx))
  }
  const saveCategories = async () => {
    setSavingCats(true)
    try {
      const cleaned = categories.filter(c => c.name.trim() !== "")
      const res = await userCategoriesAPI.put(cleaned)
      setCategories(res || cleaned)
      setCategoriesCount((res || cleaned).length)
      alert("✅ Kategorien gespeichert")
    } catch {
      alert("❌ Speichern fehlgeschlagen")
    } finally {
      setSavingCats(false)
    }
  }

  const toggleFlag = (k: string) => {
    setFlags(prev => {
      const next = { ...prev, [k]: !prev[k] }
      localStorage.setItem("featureFlags", JSON.stringify(next))
      try { window.dispatchEvent(new Event("mk:flags")) } catch {}
      return next
    })
  }
  const resetFlags = () => {
    const next: Record<string, boolean> = {}
    localStorage.setItem("featureFlags", JSON.stringify(next))
    setFlags(next)
    try { window.dispatchEvent(new Event("mk:flags")) } catch {}
  }

  const copyDiagnostics = async () => {
    const diag = {
      apiBase,
      health,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language,
      userAgent: navigator.userAgent,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      themeMode: document.documentElement.getAttribute("data-theme-mode"),
      prefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    }
    try { await navigator.clipboard.writeText(JSON.stringify(diag, null, 2)); alert("📋 Diagnostics kopiert") } catch { alert("❌ Kopieren fehlgeschlagen") }
  }

  return (
    <div className="p-10 md:p-12 space-y-16">
      {/* Hero header with animated blobs */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 md:p-10">
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-tr from-fuchsia-500/30 to-blue-500/30 blur-3xl animate-gradient-shift" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-500/30 to-emerald-500/30 blur-3xl animate-gradient-shift" />
        <div className="flex items-start justify-between gap-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center border border-white/20 shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white/90">Admin</h1>
              <p className="text-slate-200/80 mt-1">Systemeinstellungen, Datenpflege und Hintergrundjobs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="glass-card" onClick={checkHealth}>
              <RefreshCw className="h-4 w-4 mr-2" /> Health
            </Button>
            <Button variant="outline" size="sm" className="glass-card" onClick={copyDiagnostics}>
              <Info className="h-4 w-4 mr-2" /> Diagnostics
            </Button>
          </div>
        </div>
        {/* quick stats bar */}
        <div className="mt-8 flex flex-wrap gap-5 items-center justify-between rounded-lg bg-white/5 border border-white/10 px-8 py-6 text-sm text-slate-100 relative overflow-hidden">
          <div className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/2 animate-shine" />
          <span className="flex items-center gap-2"><Server className="h-4 w-4" /> API: {apiBase}</span>
          <span className="flex items-center gap-2"><Database className="h-4 w-4" /> Kategorien: {categoriesCount}</span>
          <span className="flex items-center gap-2"><Wrench className="h-4 w-4" /> Jobs: {jobsSummary.total}</span>
          <span className="flex items-center gap-2"><Flag className="h-4 w-4" /> Flags: {Object.keys(flags).filter(k=>flags[k]).length}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
        <TabsList className="mt-2">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="data">Daten</TabsTrigger>
          <TabsTrigger value="flags">Flags</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-10">
          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {label: 'Refresh', onClick: refreshJobs, icon: <RefreshCw className="h-4 w-4" />},
              {label: 'Health', onClick: checkHealth, icon: <Server className="h-4 w-4" />},
              {label: 'Diagnostics', onClick: copyDiagnostics, icon: <Info className="h-4 w-4" />},
              {label: 'Add Category', onClick: () => { if (flags.readOnlyMode) { alert("Read‑Only aktiv – keine Änderungen möglich."); return } addCategory() }, icon: <Settings className="h-4 w-4" />},
            ].map((a, i)=>(
              <button key={i} onClick={a.onClick as any} className="button-glow group rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-900/40 px-5 py-3.5 text-sm font-medium flex items-center justify-center gap-3 hover:ring-1 hover:ring-white/30 transition disabled:opacity-60" disabled={i===3 && !!flags.readOnlyMode} title={i===3 && flags.readOnlyMode ? "Read‑Only aktiv" : undefined}>
                {a.icon} <span>{a.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-4 w-4" /> Backend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="text-sm">
                  <span className="text-slate-500">API Base:</span>{" "}
                  <span className="font-medium">{apiBase}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">Health:</span>{" "}
                  <span className="font-medium">{health?.status || "—"}</span>
                </div>
                <Button size="sm" variant="outline" onClick={checkHealth} disabled={checking}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Health prüfen
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Kategorien
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-sm text-slate-500">User‑Kategorien</div>
                <div className="text-3xl font-bold mt-1">{categoriesCount}</div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" /> Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <div className="text-sm">
                  <span className="text-slate-500">Gesamt:</span>{" "}
                  <span className="font-medium">{jobsSummary.total}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">Aktiv:</span>{" "}
                  <span className="font-medium">{jobsSummary.processing}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">Fertig:</span>{" "}
                  <span className="font-medium">{jobsSummary.completed}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">Fehler:</span>{" "}
                  <span className="font-medium">{jobsSummary.failed}</span>
                </div>
                {/* Completion meter */}
                <div className="mt-2">
                  {(() => {
                    const done = jobsSummary.completed
                    const rate = jobsSummary.total ? Math.round((done / jobsSummary.total) * 100) : 0
                    return (
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full" style={{ background: `conic-gradient(#22c55e ${rate * 3.6}deg, rgba(148,163,184,.3) 0deg)` }}>
                          <div className="absolute inset-1 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-semibold">{rate}%</div>
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500" style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                    )
                  })()}
                </div>
                <Button size="sm" variant="outline" onClick={refreshJobs}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Aktualisieren
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* CRM stats row */}
          <div className="space-y-2">
            {!!flags.experimentalCharts && (
              <div className="flex items-center justify-end gap-2 text-xs">
                <span className="text-slate-400">Chart:</span>
                <button onClick={()=>setChartMode('bars')} className={`px-2 py-1 rounded-md border ${chartMode==='bars' ? 'bg-white/10 border-white/20 text-slate-200' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>Bars</button>
                <button onClick={()=>setChartMode('area')} className={`px-2 py-1 rounded-md border ${chartMode==='area' ? 'bg-white/10 border-white/20 text-slate-200' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>Area</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500">Unternehmen</div>
                  <div className="text-3xl font-bold">{typeof stats?.companies === 'number' ? stats?.companies : "—"}</div>
                  {!!flags.experimentalCharts && (series.companies.length > 0) && (
                    chartMode === 'bars'
                      ? <MicroBars data={series.companies} dates={seriesDates} stroke="rgb(59,130,246)" from="#93c5fd" to="#1e3a8a" />
                      : <MicroArea data={series.companies} dates={seriesDates} stroke="rgb(59,130,246)" from="#93c5fd" to="#1e3a8a" />
                  )}
                </div>
                <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500">Kontakte</div>
                  <div className="text-3xl font-bold">{typeof stats?.contacts === 'number' ? stats?.contacts : "—"}</div>
                  {!!flags.experimentalCharts && (series.contacts.length > 0) && (
                    chartMode === 'bars'
                      ? <MicroBars data={series.contacts} dates={seriesDates} stroke="rgb(34,197,94)" from="#86efac" to="#065f46" />
                      : <MicroArea data={series.contacts} dates={seriesDates} stroke="rgb(34,197,94)" from="#86efac" to="#065f46" />
                  )}
                </div>
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500">Deals</div>
                  <div className="text-3xl font-bold">{typeof stats?.deals === 'number' ? stats?.deals : "—"}</div>
                  {!!flags.experimentalCharts && (series.deals.length > 0) && (
                    chartMode === 'bars'
                      ? <MicroBars data={series.deals} dates={seriesDates} stroke="rgb(168,85,247)" from="#d8b4fe" to="#581c87" />
                      : <MicroArea data={series.deals} dates={seriesDates} stroke="rgb(168,85,247)" from="#d8b4fe" to="#581c87" />
                  )}
                </div>
                <Contact2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </CardContent>
            </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-8">
          <Card className="glass-card">
            <CardHeader className="p-6 pb-4 flex flex-row flex-wrap items-start justify-between gap-3">
              <CardTitle>Hintergrund‑Jobs</CardTitle>
              <Button size="sm" variant="outline" onClick={refreshJobs}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {jobsLoading ? (
                <div className="py-8 text-slate-500">Lade Jobs…</div>
              ) : jobs.length === 0 ? (
                <div className="py-8 text-slate-500">Keine Jobs</div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5">
                      <tr className="text-left text-slate-400 uppercase text-xs tracking-wider">
                        <th className="py-4 px-5 font-medium">ID</th>
                        <th className="py-4 px-5 font-medium">Typ</th>
                        <th className="py-4 px-5 font-medium">Status</th>
                        <th className="py-4 px-5 font-medium">Fortschritt</th>
                        <th className="py-4 px-5 font-medium">Erstellt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {jobs.map((j) => {
                        const status = String(j.status || "").toLowerCase()
                        const statusClass =
                          status === "completed" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" :
                          status === "processing" ? "bg-blue-500/15 text-blue-300 border-blue-500/30" :
                          status === "failed" ? "bg-red-500/15 text-red-300 border-red-500/30" :
                          "bg-slate-500/15 text-slate-300 border-slate-500/30"
                        return (
                          <tr key={j.id} className="hover:bg-white/5 even:bg-white/5 transition-colors">
                            <td className="py-5 px-5 font-mono text-xs text-slate-400">{j.id}</td>
                            <td className="py-5 px-5">
                              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span className="text-slate-200">{j.type}</span>
                              </span>
                            </td>
                            <td className="py-5 px-5">
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusClass}`}>
                                {status === "processing" && <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />}
                                {j.status}
                              </span>
                            </td>
                            <td className="py-5 px-5">
                              {typeof j.progress === "number" && status === "processing" ? (
                                <div className="w-48 h-2 rounded-full bg-white/10 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${j.progress}%` }} />
                                </div>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-5 px-5 text-slate-400">{new Date(j.created_at).toLocaleString("de-DE")}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DATA */}
        <TabsContent value="data" className="space-y-8">
          <Card className="glass-card">
            <CardHeader className="p-6 pb-4 flex flex-row flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>User‑Kategorien bearbeiten</CardTitle>
                  <div className="text-xs text-slate-400 mt-0.5">Definiere farbige Labels für Aktivitäten, Reports und Boards</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="glass-card hover:ring-1 hover:ring-blue-500/30" onClick={()=>{ if (flags.readOnlyMode) { alert("Read‑Only aktiv – keine Änderungen möglich."); return } addCategory() }} disabled={!!flags.readOnlyMode} title={flags.readOnlyMode ? "Read‑Only aktiv" : undefined}>
                  <Plus className="h-4 w-4 mr-2" /> Hinzufügen
                </Button>
                <Button size="sm" className="button-glow bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500" onClick={()=>{ if (flags.readOnlyMode) { alert("Read‑Only aktiv – keine Änderungen möglich."); return } saveCategories() }} disabled={savingCats || !!flags.readOnlyMode} title={flags.readOnlyMode ? "Read‑Only aktiv" : undefined}>
                  {savingCats ? "Speichern…" : "Speichern"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-8">
              {categories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 mx-auto mb-4 flex items-center justify-center">
                    <Tag className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="text-slate-300 mb-2">Keine Kategorien</div>
                  <div className="text-slate-400 text-sm mb-4">Füge deine ersten Kategorien hinzu und vergebe Farben</div>
                  <Button variant="outline" size="sm" onClick={addCategory}><Plus className="h-4 w-4 mr-2" /> Hinzufügen</Button>
                </div>
              ) : (
                categories.map((c, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-7 grid grid-cols-1 md:grid-cols-12 gap-7 items-center">
                    <div className="md:col-span-7">
                      <Input value={c.name} placeholder="Name (z.B. Social, Email, Event)" onChange={(e)=> updateCategory(idx, "name", e.target.value)} />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <input
                        type="color"
                        className="h-10 w-12 rounded-md border border-white/10 bg-transparent p-1"
                        value={c.color}
                        onChange={(e)=> updateCategory(idx, "color", e.target.value)}
                        title="Farbe wählen"
                      />
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2 py-1">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-xs text-slate-300">Beispiel</span>
                      </span>
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <Button variant="outline" size="sm" onClick={()=> { if (flags.readOnlyMode) { alert("Read‑Only aktiv – keine Änderungen möglich."); return } removeCategory(idx) }} disabled={!!flags.readOnlyMode} title={flags.readOnlyMode ? "Read‑Only aktiv" : undefined}>Entfernen</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FLAGS */}
        <TabsContent value="flags" className="space-y-8">
          <Card className="glass-card">
            <CardHeader className="p-6 pb-4 flex flex-row flex-wrap items-start justify-between gap-4">
              <CardTitle className="tracking-tight">Feature Flags (lokal)</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Aktiv: {Object.keys(flags).filter(k=>flags[k]).length}</span>
                <Button variant="outline" size="sm" onClick={resetFlags}>Reset</Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8">
              {([
                { key: "experimentalCharts", label: "Experimentelle Charts", desc: "Neue Mini‑Charts & Interaktionen", Icon: FlaskConical },
                { key: "compactSidebar", label: "Kompakte Sidebar", desc: "Schmalere Navigation & mehr Platz", Icon: PanelLeft },
                { key: "debugNetwork", label: "Netzwerk Debug", desc: "XHR/Fetch Logging in der Konsole", Icon: Bug },
                { key: "aiReportDeterministic", label: "AI Report (deterministisch)", desc: "Weniger kreative, stabilere Texte", Icon: Bot },
                { key: "gridBackground", label: "Subtiles Grid", desc: "Gitter‑Hintergrund im Layout", Icon: Grid3X3 },
                { key: "devRibbon", label: "DEV Ribbon", desc: "Zeigt DEV‑Banner oben rechts", Icon: Info },
                { key: "reducedMotion", label: "Weniger Animationen", desc: "Reduziert Animationen/Transitions (Performance)", Icon: Monitor },
                { key: "autoRefresh", label: "Auto‑Refresh", desc: "Regelmässig Daten neu laden (1×/min)", Icon: Clock3 },
                { key: "readOnlyMode", label: "Schreibschutz (Read‑Only)", desc: "Blockiert Änderungen – ideal für Demos", Icon: Lock },
              ] as const).map(({ key, label, desc, Icon }) => {
                const active = !!flags[key]
                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/10 bg-white/5 px-8 py-8 flex items-center justify-between gap-6 hover:bg-white/10 transition cursor-pointer"
                    onClick={() => toggleFlag(key)}
                    role="switch"
                    aria-checked={active}
                    aria-label={`${label} ${active ? "ON" : "OFF"}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-slate-200/10 to-white/10 border border-white/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-slate-200" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-200 truncate text-[15px]">{label}</div>
                        <div className="text-xs text-slate-400 truncate mt-2 leading-relaxed">{desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFlag(key) }}
                      className={`relative h-8 w-16 rounded-full border transition-all ${active ? "bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-400/40 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" : "bg-white/10 border-white/20"}`}
                      aria-pressed={active}
                      aria-label={`${label} ${active ? "ON" : "OFF"}`}
                    >
                      <span
                        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white/90 dark:bg-slate-900/90 shadow transition-transform ${active ? "translate-x-8" : ""}`}
                      />
                    </button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SYSTEM */}
        <TabsContent value="system" className="space-y-8">
          <Card className="glass-card">
            <CardHeader className="p-6 pb-4 flex items-center justify-between">
              <CardTitle>Systeminformationen</CardTitle>
              <Button variant="outline" size="sm" className="glass-card" onClick={copyDiagnostics}><Info className="h-4 w-4 mr-2" /> Copy diagnostics</Button>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center">
                    <Clock3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Timezone</div>
                    <div className="font-medium text-slate-200">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/30 to-lime-500/30 border border-white/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Locale</div>
                    <div className="font-medium text-slate-200">{typeof navigator !== "undefined" ? navigator.language : "—"}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-white/10 flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-400">Theme Mode</div>
                    <div className="font-medium text-slate-200">{typeof document !== "undefined" ? (document.documentElement.getAttribute("data-theme-mode") || "auto") : "—"}</div>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                      {prefersDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                      <span className="text-slate-300">{prefersDark ? "Prefers Dark" : "Prefers Light"}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-sky-500/30 border border-white/10 flex items-center justify-center">
                    <Wifi className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Network</div>
                    <div className={`font-medium ${viewport.online ? "text-emerald-300" : "text-red-300"}`}>{viewport.online ? "Online" : "Offline"}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Viewport {viewport.w}×{viewport.h} @ {viewport.dpr}x</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-xs text-slate-400 mb-1">User Agent</div>
                <div className="font-mono text-xs text-slate-300 break-words">{typeof navigator !== "undefined" ? navigator.userAgent : "—"}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS (placeholder kept) */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => alert("Kommt bald: Cache leeren")}>
                Cache leeren
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Kommt bald: Reindex starten")}>
                Reindex
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Kommt bald: DB‑Export")}>
                DB Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Kommt bald: Konfiguration speichern")}>
                Konfiguration speichern
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Kommt bald: Wartungsmodus")}>
                Wartungsmodus
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


