"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserCategories } from "@/hooks/use-user-categories"
import { Palette, Plus, Save, Sparkles, Trash2 } from "lucide-react"

export type UserCategory = { name: string; color: string }

export default function CategorySetup({ onReady }: { onReady?: (cats: UserCategory[]) => void }) {
  const { categories, save } = useUserCategories()
  const [items, setItems] = React.useState<UserCategory[]>([
    { name: "", color: "#3b82f6" },
  ])

  React.useEffect(() => {
    if (categories && categories.length > 0) {
      setItems(categories)
    }
  }, [categories, onReady])

  const add = () => {
    if (items.length >= 5) return
    setItems([...items, { name: "", color: "#8b5cf6" }])
  }

  const update = (idx: number, patch: Partial<UserCategory>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const onSave = () => {
    const cleaned = items.map((i) => ({ name: i.name.trim() || "Kategorie", color: i.color }))
    save(cleaned)
    onReady?.(cleaned)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Kompakter Glass‑Card Stil, чтобы вписаться в Sidebar‑карточку „Kategorien“ */}
      <Card className="glass-card relative rounded-2xl">
        <CardHeader className="relative pb-3 pt-3 sm:pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-slate-50">
                <Palette className="h-5 w-5 text-violet-300" />
                Kategorien einrichten
              </CardTitle>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Definieren Sie bis zu fünf individuelle Kategorien. Die Farben erscheinen im Marketing‑Kreis,
                in Badges und Auswertungen.
              </p>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-100">
              <Sparkles className="h-3 w-3" />
              <span>Empfohlen für den Start</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative pt-1 pb-3 sm:pb-4">
          <div className="space-y-3">
            {items.map((it, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18, delay: idx * 0.03 }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 shadow-sm hover:border-violet-400/40 hover:bg-slate-900/80 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-900/80">
                  <span
                    className="h-5 w-5 rounded-full shadow-[0_0_0_2px_rgba(15,23,42,0.9)]"
                    style={{ backgroundColor: it.color }}
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    placeholder={`Kategorie #${idx + 1}`}
                    value={it.name}
                    onChange={(e) => update(idx, { name: e.target.value })}
                    className="w-full h-9 rounded-lg border border-white/10 bg-slate-950/80 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-0 focus:border-violet-400/70 focus:ring-1 focus:ring-violet-500/40 transition-all"
                  />
                  <p className="text-[11px] text-slate-500">
                    Diese Kategorie wird im Kreis und in Listen angezeigt.
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <label className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="hidden sm:inline">Farbe</span>
                    <input
                      type="color"
                      value={it.color}
                      onChange={(e) => update(idx, { color: e.target.value })}
                      className="h-8 w-10 cursor-pointer rounded-md border border-white/15 bg-transparent p-0"
                    />
                  </label>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => remove(idx)}
                    disabled={items.length <= 1}
                    className="h-8 w-8 border-red-500/40 bg-red-500/5 text-red-200 hover:bg-red-500/15 hover:text-red-50 disabled:border-slate-700/60 disabled:bg-transparent disabled:text-slate-600"
                    title="Kategorie entfernen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={add}
                  disabled={items.length >= 5}
                  className="inline-flex items-center gap-2 border-dashed border-violet-500/60 bg-slate-900/60 text-violet-100 hover:bg-violet-600/20 hover:border-violet-400/80 disabled:border-slate-700/60 disabled:text-slate-600"
                >
                  <Plus className="h-4 w-4" />
                  Kategorie
                </Button>
                <span className="text-[11px] text-slate-500">
                  {items.length}/5 Kategorien
                </span>
              </div>

              <Button
                onClick={onSave}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/30 hover:from-violet-400 hover:via-fuchsia-400 hover:to-sky-400 hover:shadow-violet-500/40"
              >
                <Save className="h-4 w-4" />
                Speichern
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}


