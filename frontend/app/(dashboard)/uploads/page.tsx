"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUploadsApi } from "@/hooks/use-uploads-api"

type PreviewState = {
  headers: string[]
  samples: any[]
  mapping: Record<string, string | null>
}

export default function UploadsPage() {
  const { uploads, previewFile, uploadFile, refresh } = useUploadsApi()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (f: File | null) => {
    setError(null)
    setPreview(null)
    setFile(f)
    if (!f) return
    try {
      setLoadingPreview(true)
      const res = await previewFile(f)
      setPreview({
        headers: res.headers,
        samples: res.samples,
        mapping: res.suggested_mapping || {},
      })
    } catch (e: any) {
      setError(e?.message || "Preview failed")
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    try {
      setError(null)
      setUploading(true)
      await uploadFile(file, undefined, preview?.mapping)
      setFile(null)
      setPreview(null)
      await refresh()
    } catch (e: any) {
      setError(e?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">Uploads</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Lade eine CSV- oder Excel-Tabelle hoch, sieh dir ein Preview an und importiere die Aktivitäten in das System.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-slate-300 dark:border-white/20"
          onClick={() => refresh()}
        >
          Neu laden
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
        <Card className="lg:col-span-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Datei auswählen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-900 dark:text-slate-100 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-100 dark:hover:file:bg-slate-700"
            />
            {file && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Ausgewählt: <span className="font-medium break-all">{file.name}</span>
              </div>
            )}
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? "Importiere…" : "Datei importieren"}
            </Button>
            {error && (
              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md px-2 py-1">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              {loadingPreview ? "Lade Preview…" : "Preview & Feldzuordnung"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!preview && !loadingPreview && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Wähle zuerst eine Datei aus, um ein Preview der ersten Zeilen zu sehen. Unterstützt werden CSV und XLSX.
              </p>
            )}
            {preview && (
              <div className="space-y-4">
                <div className="overflow-auto border border-slate-200 dark:border-white/10 rounded-lg max-h-72">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                      <tr>
                        {preview.headers.map((h) => (
                          <th key={h} className="px-2 py-1 text-left font-medium text-slate-600 dark:text-slate-200 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900">
                      {preview.samples.map((row, idx) => (
                        <tr key={idx} className="border-t border-slate-100 dark:border-slate-800">
                          {preview.headers.map((h) => (
                            <td key={h} className="px-2 py-1 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                              {String(row[h] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {preview.samples.length === 0 && (
                        <tr>
                          <td
                            colSpan={preview.headers.length || 1}
                            className="px-2 py-4 text-center text-slate-500 dark:text-slate-400"
                          >
                            Keine Datenzeilen gefunden.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Empfohlene Zuordnung (kann bei Bedarf im Code angepasst werden):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(preview.mapping).map(([field, header]) => (
                      <div
                        key={field}
                        className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 bg-slate-50 dark:bg-slate-800/60"
                      >
                        <div className="font-semibold text-slate-700 dark:text-slate-100">{field}</div>
                        <div className="text-slate-500 dark:text-slate-300">
                          {header || <span className="italic text-slate-400">nicht zugeordnet</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Bisherige Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Noch keine Uploads vorhanden.
            </p>
          ) : (
            <div className="overflow-auto max-h-72">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-200">Datei</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-200">Typ</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-200">Größe</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-200">Hochgeladen</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900">
                  {uploads.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-100 break-all">
                        {u.original_name}
                      </td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-300">
                        {u.file_type || "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-300">
                        {u.file_size ? `${u.file_size} B` : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-300 whitespace-nowrap">
                        {u.created_at ? new Date(u.created_at).toLocaleString("de-DE") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUploadsApi, useJobsApi } from "@/hooks/use-uploads-api"
import { Upload, FileText, Download, RefreshCw, Loader2, HardDrive, CheckCircle2, Clock3, XCircle } from "lucide-react"
import * as React from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import RadialCircle from "@/components/circle/radial-circle"
import { useModal } from "@/components/ui/modal/ModalProvider"

export default function UploadsPage() {
  const { uploads, isLoading: uploadsLoading, uploadFile, previewFile, refresh: refreshUploads } = useUploadsApi()
  const { jobs, isLoading: jobsLoading, refresh: refreshJobs } = useJobsApi()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [progress, setProgress] = React.useState<number | null>(null)
  const [toast, setToast] = React.useState<string | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<{ headers: string[]; samples: any[]; suggested_mapping: Record<string, string | null> } | null>(null)
  const [mapping, setMapping] = React.useState<Record<string, string | null>>({ title: null, category: null, status: null, budget: null, notes: null, start: null, end: null, weight: null })
  const required: Array<keyof typeof mapping> = ['title']
  const isValid = required.every((k)=> Boolean(mapping[k]))
  const { openModal, closeModal } = useModal()
  // ---

  // light polling while there are processing jobs (must be before any early returns)
  React.useEffect(() => {
    if (jobs.some(j => j.status === 'processing')) {
      const t = setInterval(() => { refreshJobs(); refreshUploads() }, 1000)
      return () => clearInterval(t)
    }
  }, [jobs, refreshJobs, refreshUploads])

  const circleActivities = React.useMemo(() => {
    if (!preview) return [] as any[]
    const rows = preview.samples || []

    const parseDate = (v: any): Date | undefined => {
      if (!v) return undefined
      if (v instanceof Date) return v
      const s = String(v)
      // dd.MM.yyyy
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
        const [d, m, y] = s.split('.')
        return new Date(Number(y), Number(m) - 1, Number(d))
      }
      const d = new Date(s)
      return isNaN(d.getTime()) ? undefined : d
    }

    const titleKey = mapping.title || 'Title'
    const catKey = mapping.category || 'Category'
    const statusKey = mapping.status || 'Status'
    const startKey = mapping.start || 'Start'
    const endKey = mapping.end || 'End'
    const weightKey = mapping.weight || 'Weight'
    const budgetKey = mapping.budget || 'BudgetCHF'
    const notesKey = mapping.notes || 'Notes'

    return rows.map((row: any, idx: number) => {
      const rawStatus = String(row[statusKey] ?? 'ACTIVE').toUpperCase()
      return {
        id: `preview-${idx}`,
        title: String(row[titleKey] ?? 'Untitled'),
        category: String(row[catKey] ?? 'VERKAUFSFOERDERUNG').toUpperCase(),
        status: rawStatus === 'COMPLETED' ? 'DONE' : rawStatus,
        start: parseDate(row[startKey]) || new Date(),
        end: parseDate(row[endKey]),
        weight: Number(row[weightKey] ?? 50) || 50,
        budgetCHF: Number(row[budgetKey] ?? 0) || 0,
        expectedLeads: 0,
        notes: row[notesKey] ?? '',
      }
    })
  }, [preview, mapping])

  if (uploadsLoading || jobsLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setSelectedFile(file)
    try {
      const p = await previewFile(file)
      setPreview(p)
      setMapping({
        title: p.suggested_mapping.title || null,
        category: p.suggested_mapping.category || null,
        status: p.suggested_mapping.status || null,
        budget: p.suggested_mapping.budget || null,
        notes: p.suggested_mapping.notes || null,
        start: p.suggested_mapping.start || null,
        end: p.suggested_mapping.end || null,
        weight: p.suggested_mapping.weight || null,
      })
    } catch (e) {
      console.error(e)
      setToast('❌ Vorschau fehlgeschlagen')
      setTimeout(() => setToast(null), 2000)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 space-y-6 sm:space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white/90 flex items-center gap-2 sm:gap-3">
              <Upload className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-400 shrink-0" />
              Uploads & Jobs
            </h1>
            <p className="text-slate-300 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Datei-Uploads und Hintergrund-Jobs – Live Daten</p>
          </div>
          <div className="inline-flex items-center self-start">
            <input ref={inputRef} type="file" className="hidden" onChange={(e)=> onFiles(e.target.files)} />
            <Button className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg hover:opacity-90 h-9 sm:h-10 text-xs sm:text-sm" onClick={()=> inputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Datei hochladen
            </Button>
          </div>
        </div>
        {/* Compact stats bar */}
        <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-200">
          <span>📁 Uploads: {uploads.length}</span>
          <span>🗂 Dateien: {uploads.length}</span>
          <span>⚙️ Jobs: {jobs.length}</span>
          <span>💡 Aktiv: {jobs.filter(j=>j.status==='processing').length}</span>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <Card className={`bg-white/5 border-white/10 backdrop-blur-xl ${dragOver ? 'ring-2 ring-blue-400/60' : ''}`}>
        <CardContent className="p-3 sm:p-6">
          <div
            className="border-2 border-dashed border-white/20 rounded-xl p-6 sm:p-8 text-center text-slate-300 cursor-pointer"
            onClick={()=> inputRef.current?.click()}
            onDragOver={(e)=>{ e.preventDefault(); setDragOver(true) }}
            onDragLeave={()=> setDragOver(false)}
            onDrop={(e)=>{ e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files) }}
          >
            <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-blue-400" />
            <div className="text-sm sm:text-base">Dateien hier ablegen oder klicken zum Auswählen</div>
            {progress !== null && (
              <div className="mt-3 h-2 w-full rounded bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview & Mapping */}
      {preview && selectedFile && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-white">Vorschau & Zuordnung</CardTitle>
              <div className="flex gap-2">
                <a href="/api/uploads/template.csv" target="_blank" className="inline-flex items-center rounded-md border border-white/20 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">CSV Vorlage</a>
                <a href="/api/uploads/template.xlsx" target="_blank" className="inline-flex items-center rounded-md border border-white/20 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Excel Vorlage</a>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm text-slate-300">
                <thead>
                  <tr>
                    {preview.headers.map((h) => (
                      <th key={h} className="px-2 py-1 border-b border-white/10 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.samples.map((row, idx) => (
                    <tr key={idx}>
                      {preview.headers.map((h) => (
                        <td key={h} className="px-2 py-1 border-b border-white/5">{String(row[h] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-xs text-slate-400">Felder mit * sind Pflichtfelder</div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['title','category','status','budget','notes','start','end','weight'] as const).map((field) => (
                <div key={field} className="text-slate-200">
                  <div className={`text-xs mb-1 ${required.includes(field) ? 'text-red-300' : 'text-slate-400'}`}>
                    {field.toUpperCase()} {required.includes(field) && <span className="text-red-400">*</span>}
                  </div>
                  <select
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-md px-2 py-2"
                    value={mapping[field] || ''}
                    onChange={(e)=> setMapping(prev => ({ ...prev, [field]: e.target.value || null }))}
                  >
                    <option value="">— Nicht zuordnen —</option>
                    {preview.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-500"
                disabled={!isValid}
                onClick={async ()=>{
                  if (!selectedFile) return
                  setProgress(10)
                  try {
                    await uploadFile(selectedFile, p=>setProgress(p), mapping)
                    setToast('✅ Datei importiert')
                    setPreview(null); setSelectedFile(null)
                    setTimeout(()=> setToast(null), 1500)
                  } finally {
                    setProgress(null); refreshUploads(); refreshJobs()
                  }
                }}
              >
                {isValid ? 'Import starten' : 'Felder zuordnen'}
              </Button>
              <Button variant="outline" className="border-white/20 text-slate-200" onClick={()=>{ setPreview(null); setSelectedFile(null) }}>Abbrechen</Button>
              <Button
                variant="outline"
                className="border-white/20 text-slate-200"
                onClick={() => {
                  openModal({
                    type: 'custom',
                    title: 'Vorschau – Marketing Circle',
                    content: (
                      <CirclePreview activities={circleActivities} />
                    )
                  })
                }}
              >
                Preview in Circle
              </Button>
            </div>

            {/* Pie preview of category distribution */}
            <div className="mt-6">
              <div className="text-slate-300 mb-2 text-sm">Vorschau der Kategorien (aus den ersten Zeilen)</div>
              <div className="h-56 bg-slate-900/50 border border-slate-800 rounded-md">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(preview?.samples || []).reduce((acc: any[], row: any) => {
                        const catHeader = mapping.category || 'Category'
                        const name = String(row[catHeader as any] || 'OTHER').toUpperCase()
                        const found = acc.find((x:any)=>x.name===name)
                        if (found) found.value += 1; else acc.push({ name, value: 1 })
                        return acc
                      }, [])}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} stroke="#0f172a"
                    >
                      {((preview?.samples||[]).length>0 ? Array.from(new Set((preview?.samples||[]).map((r:any)=>String(r[mapping.category||'Category']||'OTHER').toUpperCase()))) : []).map((name, idx)=> (
                        <Cell key={String(name)+idx} fill={["#3b82f6","#a78bfa","#10b981","#f59e0b","#64748b"][idx%5]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: 8 }}
                      labelStyle={{ color: '#e5e7eb' }}
                      itemStyle={{ color: '#e5e7eb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-emerald-200 shadow-lg">
          {toast}
        </div>
      )}

      {/* Stats (secondary) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm text-slate-300 flex items-center gap-1.5 sm:gap-2"><HardDrive className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" /> Hochgeladen</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{uploads.length}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Dateien</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm text-slate-300">Jobs</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400">{jobs.length}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Gesamt</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm text-slate-300 flex items-center gap-1.5 sm:gap-2"><Clock3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-300" /> Aktiv</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400">
              {jobs.filter(j => j.status === 'processing').length}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">In Bearbeitung</p>
          </CardContent>
        </Card>
      </div>

      {/* Uploads & Jobs grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Hochgeladene Dateien ({uploads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300">Keine Dateien hochgeladen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/3 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-blue-400" />
                    <div>
                      <p className="font-semibold text-white">{upload.original_name}</p>
                      <p className="text-sm text-slate-300">
                        {formatFileSize(upload.file_size)} • {upload.file_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {new Date(upload.created_at).toLocaleDateString('de-DE')}
                    </span>
                    <Button variant="outline" size="sm" className="border-white/20 text-slate-200">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Hintergrund-Jobs ({jobs.length})</CardTitle>
          <Button variant="outline" size="sm" className="border-white/20 text-slate-200" onClick={()=>{ refreshJobs(); refreshUploads(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 text-slate-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-300">Keine aktiven Jobs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/3">
                  <div>
                    <p className="font-semibold text-white capitalize">{job.type}</p>
                    <p className="text-sm text-slate-300">
                      {new Date(job.created_at).toLocaleString('de-DE')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {job.progress !== undefined && job.status === 'processing' && (
                      <div className="text-sm text-blue-300">{job.progress}%</div>
                    )}
                    <div className="flex items-center gap-1 text-xs font-medium">
                      {job.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                      {job.status === 'processing' && <Loader2 className="h-4 w-4 text-blue-300 animate-spin" />}
                      {job.status === 'failed' && <XCircle className="h-4 w-4 text-red-400" />}
                      <span className={`${job.status === 'completed' ? 'text-green-300' : job.status === 'processing' ? 'text-blue-300' : job.status === 'failed' ? 'text-red-300' : 'text-slate-300'}`}>{job.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

function CirclePreview({ activities }: { activities: any[] }) {
  const [zoom, setZoom] = React.useState(1)
  const base = 620
  const minZoom = 0.6
  const maxZoom = 1.8
  const clamp = (v: number) => Math.min(maxZoom, Math.max(minZoom, v))
  return (
    <div className="relative w-full flex items-center justify-center py-10">
      {/* Controls pinned to bottom center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <span className="px-3 py-1 rounded bg-slate-800/70 border border-slate-700 text-slate-200">Zoom: {zoom.toFixed(1)}x</span>
        <Button size="sm" variant="outline" onClick={() => setZoom(z => clamp(parseFloat((z - 0.2).toFixed(1))))}>-</Button>
        <Button size="sm" variant="outline" onClick={() => setZoom(z => clamp(parseFloat((z + 0.2).toFixed(1))))}>+</Button>
      </div>
      <div className="relative" style={{ width: base, height: base, overflow: 'visible' }}>
        <div style={{ width: base, height: base, transform: `scale(${zoom})`, transformOrigin: 'center' }}>
          <RadialCircle
            activities={activities}
            size={base}
            year={new Date().getFullYear()}
            onActivityClick={() => {}}
          />
        </div>
      </div>
    </div>
  )
}



