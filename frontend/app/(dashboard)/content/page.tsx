"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus, ArrowLeft, Filter, Download, Image, Video, Calendar as CalIcon, MoreHorizontal, User, File } from "lucide-react"
import Link from "next/link"
import { useModal } from "@/components/ui/modal/ModalProvider"
import { motion } from "framer-motion"
import { sync } from "@/lib/sync"
import { ResponsiveContainer, AreaChart, Area } from "recharts"
import { GlassSelect } from "@/components/ui/glass-select"
import { Input } from "@/components/ui/input"

type ContentStatus = "idea" | "draft" | "review" | "approved" | "published"

interface ContentItem {
  id: number
  title: string
  type: "blog" | "social" | "video" | "email" | "asset"
  status: ContentStatus
  assignee: string
  dueDate: string
  tags: string[]
  priority: "low" | "medium" | "high"
}

export default function ContentPage() {
  const { openModal } = useModal()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [contents, setContents] = useState<ContentItem[]>([
    { id: 1, title: "Q1 Marketing Blog Post", type: "blog", status: "draft", assignee: "Anna Schmidt", dueDate: "2024-01-20", tags: ["Marketing", "Blog"], priority: "high" },
    { id: 2, title: "Instagram Carousel - Product Launch", type: "social", status: "review", assignee: "Peter Weber", dueDate: "2024-01-18", tags: ["Social Media", "Product"], priority: "high" },
    { id: 3, title: "Welcome Email Template", type: "email", status: "approved", assignee: "Hans Müller", dueDate: "2024-01-22", tags: ["Email", "Onboarding"], priority: "medium" },
  ])
  const [view, setView] = useState<"grid" | "kanban">(() => {
    if (typeof window === "undefined") return "grid"
    return (localStorage.getItem("contentView") as "grid" | "kanban") || "grid"
  })
  useEffect(() => {
    try { localStorage.setItem("contentView", view) } catch {}
  }, [view])
  const [statusTab, setStatusTab] = useState<"ALL" | ContentStatus>("ALL")
  const [q, setQ] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<"all" | ContentItem["type"]>("all")
  const [assignee, setAssignee] = useState<"all" | string>("all")

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/crm/deals', { credentials: 'include' })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const data = await response.json()
      setDeals(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setDeals([])
    } finally { setLoading(false) }
  }
  useEffect(() => {
    load()
    const unsub = [
      sync.on('global:refresh', load),
      sync.on('crm:companies:changed', load),
      sync.on('activities:changed', load),
    ]
    return () => { unsub.forEach(fn => fn && (fn as any)()) }
  }, [])

  const campaigns = [
    {
      title: "Q4 Marketing Campaign",
      channel: "LinkedIn",
      description: "Social media campaign for Q4 product launch",
      due: "2024-12-15",
      slug: "q4-marketing-campaign",
    },
    {
      title: "Product Newsletter",
      channel: "Email",
      description: "Monthly newsletter featuring new features",
      due: "2024-12-10",
      slug: "product-newsletter",
    },
  ] as const

  const iconForChannel = (channel: string) => {
    const c = channel.toLowerCase()
    if (c.includes("email")) return <FileText className="h-5 w-5 text-blue-500" />
    if (c.includes("linked")) return <Image className="h-5 w-5 text-sky-400" />
    if (c.includes("insta")) return <Image className="h-5 w-5 text-pink-400" />
    if (c.includes("web")) return <File className="h-5 w-5 text-indigo-400" />
    return <FileText className="h-5 w-5 text-slate-300" />
  }

  const getTypeIcon = (type: ContentItem["type"]) => {
    switch (type) {
      case "blog": return <FileText className="h-4 w-4" />
      case "social": return <Image className="h-4 w-4" />
      case "video": return <Video className="h-4 w-4" />
      case "email": return <File className="h-4 w-4" />
      case "asset": return <File className="h-4 w-4" />
    }
  }

  const getColumnColor = (id: ContentStatus) => {
    switch (id) {
      case "idea": return "#94a3b8"
      case "draft": return "#60a5fa"
      case "review": return "#f59e0b"
      case "approved": return "#a78bfa"
      case "published": return "#34d399"
    }
  }

  const makeSeries = (base: number) =>
    Array.from({ length: 12 }, (_, i) => ({ y: Math.max(1, Math.round((base || 1) * (0.6 + 0.4 * Math.sin((i + 1) / 1.5)))) }))

  const statuses: ContentStatus[] = ["idea", "draft", "review", "approved", "published"]
  const nextStatus = (s: ContentStatus): ContentStatus => {
    const idx = statuses.indexOf(s)
    return statuses[(idx + 1) % statuses.length]
  }
  const updateStatus = (id: number, s: ContentStatus) => {
    setContents(prev => prev.map(c => (c.id === id ? { ...c, status: s } : c)))
  }
  const onDragStart = (id: number) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", String(id))
    e.dataTransfer.effectAllowed = "move"
  }
  const onDropTo = (s: ContentStatus) => (e: React.DragEvent) => {
    e.preventDefault()
    const id = Number(e.dataTransfer.getData("text/plain"))
    if (!Number.isNaN(id)) updateStatus(id, s)
  }
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move" }

  const assignees = Array.from(new Set(contents.map(c => c.assignee))).sort()
  const matchesFilters = (c: ContentItem) => {
    const qMatch = !q || c.title.toLowerCase().includes(q.toLowerCase()) || c.tags.join(" ").toLowerCase().includes(q.toLowerCase())
    const tMatch = typeFilter === "all" || c.type === typeFilter
    const aMatch = assignee === "all" || c.assignee === assignee
    const sMatch = statusTab === "ALL" || c.status === statusTab
    return qMatch && tMatch && aMatch && sMatch
  }
  const filteredContents = contents.filter(matchesFilters)

  return (
    <div className="space-y-8 p-6 md:p-8 min-h-screen">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 md:p-10 text-white shadow-2xl border border-white/10">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-fuchsia-500/30 to-blue-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-500/30 to-emerald-500/30 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center border border-white/20 shadow">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold">Content Hub</h1>
                <p className="text-sm text-white/70">Content Management</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="bg-white/10 text-white hover:bg-white/20">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="bg-white/10 text-white hover:bg-white/20">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90" onClick={() => openModal({ type: "form", title: "Neuen Content hinzufügen", fields: [{ name: "title", type: "text", label: "Titel", required: true }], onSubmit: () => openModal({ type: "info", title: "Content erstellt!" }) })}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Content
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar: tabs + search/filters + view toggle */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["ALL", ...statuses] as const).map((t) => {
            const count = t === "ALL" ? contents.length : contents.filter(c => c.status === t).length
            const active = statusTab === t
            return (
              <button
                key={t}
                onClick={() => setStatusTab(t as any)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${active ? "bg-white/15 text-white border-white/30" : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"}`}
              >
                {t.toString().toUpperCase()} <span className="ml-1 text-white/60">({count})</span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suche Titel oder Tags…"
            className="h-10 w-64 rounded-xl px-3 text-sm bg-white/10 dark:bg-slate-900/50 text-white placeholder:text-white/60 border border-white/20 dark:border-slate-700 focus:ring-blue-500/40"
          />
          <GlassSelect
            value={String(typeFilter)}
            onChange={(v) => setTypeFilter(v as any)}
            options={[
              { value: "all", label: "Alle Typen" },
              { value: "blog", label: "Blog" },
              { value: "social", label: "Social" },
              { value: "video", label: "Video" },
              { value: "email", label: "Email" },
              { value: "asset", label: "Asset" },
            ]}
            className="w-44"
          />
          <GlassSelect
            value={String(assignee)}
            onChange={(v) => setAssignee(v)}
            options={[{ value: "all", label: "Alle Bearbeiter" }, ...assignees.map(a => ({ value: a, label: a }))]}
            className="w-56"
          />
          <div className="ml-1 inline-flex rounded-lg overflow-hidden border border-white/20">
            <button onClick={() => setView("grid")} className={`px-3 h-9 text-sm ${view === "grid" ? "bg-white/20 text-white" : "bg-white/5 text-white/80"}`}>Grid</button>
            <button onClick={() => setView("kanban")} className={`px-3 h-9 text-sm ${view === "kanban" ? "bg-white/20 text-white" : "bg-white/5 text-white/80"}`}>Kanban</button>
          </div>
        </div>
      </div>

      {/* KPI level with micro-sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: "total", title: "Total Content", value: contents.length, color: "text-blue-400", stroke: "#93c5fd", fillFrom: "rgba(147,197,253,.35)", fillTo: "rgba(30,58,138,.05)" },
          { key: "deals", title: "Deals as Content", value: deals.length, color: "text-cyan-400", stroke: "#67e8f9", fillFrom: "rgba(103,232,249,.35)", fillTo: "rgba(8,145,178,.05)" },
          { key: "review", title: "Review", value: contents.filter(c=>c.status==='review').length, color: "text-amber-400", stroke: "#fbbf24", fillFrom: "rgba(251,191,36,.35)", fillTo: "rgba(146,64,14,.05)" },
          { key: "pub", title: "Veröffentlicht", value: contents.filter(c=>c.status==='published').length, color: "text-emerald-400", stroke: "#34d399", fillFrom: "rgba(52,211,153,.35)", fillTo: "rgba(6,95,70,.05)" },
        ].map((k) => (
          <Card
            key={k.key}
            className="group relative overflow-hidden backdrop-blur-xl border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 glass-card"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: `0 12px 34px ${k.fillFrom}, inset 0 0 0 1px ${k.fillFrom}` }} />
            <CardHeader className="pt-4 px-4 pb-2">
              <CardTitle className={`${k.color} flex items-center gap-2 text-sm`}>
                <FileText className={`h-4 w-4 ${k.color}`} />
                {k.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-2xl font-semibold text-white mt-1">{k.value}</div>
              <div className="mt-3 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={makeSeries(k.value)}>
                    <defs>
                      <linearGradient id={`grad-${k.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={k.stroke} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={k.stroke} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="y" stroke={k.stroke} strokeWidth={2} fill={`url(#grad-${k.key})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview grid (Level 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[
          ...campaigns,
          ...deals.slice(0, 4).map((d: any) => ({
            title: `${d.title} – Content`,
            channel: "Website",
            description: `Landing page and assets for ${d.title}`,
            due: d.expected_close_date?.slice(0, 10) || "",
            slug: (d.title || "deal").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          })),
        ].map((c, idx) => (
          <Link key={idx} href={`/content/${c.slug}`} className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="group relative overflow-hidden glass-card border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: "0 12px 34px rgba(147,197,253,.18), inset 0 0 0 1px rgba(147,197,253,.35)" }} />
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  {iconForChannel(c.channel)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 truncate">{c.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{c.channel}</p>
                </div>
              </div>
              {c.description && (
                <p className="text-sm text-slate-700/90 dark:text-slate-300/90 line-clamp-2 mb-4">{c.description}</p>
              )}
              {c.due && (
                <div className="text-xs text-slate-500 dark:text-slate-400">Due: {c.due}</div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Content items section: Grid or Kanban */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContents.map((c) => (
            <Card key={c.id} className="glass-card p-5">
              <CardContent className="p-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/90">
                      {getTypeIcon(c.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white truncate">{c.title}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] border border-white/20 text-white/80">{c.status.toUpperCase()}</span>
                      </div>
                      <p className="text-xs text-white/60 mt-1">Due: {c.dueDate} · {c.assignee}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.tags.map((t,i)=>(<span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">{t}</span>))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 px-2 glass-card" onClick={() => updateStatus(c.id, nextStatus(c.status))}>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredContents.length === 0 && (
            <Card className="glass-card"><CardContent className="p-6 text-center text-white/70">Keine Einträge</CardContent></Card>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {statuses.map((s) => {
            const list = filteredContents.filter(c => c.status === s)
            return (
              <div key={s} className="glass-card border rounded-2xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white/90 text-sm font-medium">{s.toUpperCase()}</div>
                  <div className="text-white/60 text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/20">{list.length}</div>
                </div>
                <div
                  onDrop={onDropTo(s)}
                  onDragOver={onDragOver}
                  className="space-y-2 max-h-[520px] overflow-y-auto pr-1"
                >
                  {list.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={onDragStart(c.id)}
                      className="p-3 rounded-xl bg-white/10 border border-white/15 text-white/90 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 border border-white/20">{getTypeIcon(c.type)}</span>
                          <span className="truncate">{c.title}</span>
                        </div>
                        <button onClick={() => updateStatus(c.id, nextStatus(c.status))} className="text-[11px] px-2 py-0.5 rounded bg-white/10 border border-white/20">Next</button>
                      </div>
                      <div className="mt-1 text-[11px] text-white/60">{c.assignee} · {c.dueDate}</div>
                    </div>
                  ))}
                  {list.length === 0 && (
                    <div className="text-center text-white/50 text-xs py-6 border border-dashed border-white/20 rounded-lg">Drop here</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


