"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useUserCategories } from "@/hooks/use-user-categories"
import { Palette, Plus, Save, Trash2 } from "lucide-react"

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-5 shadow-[0_20px_80px_-24px_rgba(56,189,248,0.25)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(94,234,212,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(129,140,248,0.12),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.08),transparent_30%)]" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 backdrop-blur">
              <Palette className="h-5 w-5 text-violet-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-50">Kategorien einrichten</h3>
              <p className="text-sm text-slate-400">
                Bis zu 5 individuelle Kategorien. Farben erscheinen im Kreis, in Badges und Auswertungen.
              </p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-100 shadow-[0_10px_30px_-18px_rgba(139,92,246,0.6)]">
            ✦ Empfohlen für den Start
          </div>
        </div>

        {/* Categories list */}
        <div className="space-y-3">
          {items.map((it, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: idx * 0.04 }}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-3 sm:p-3.5 shadow-inner shadow-black/20 backdrop-blur hover:border-violet-500/30 hover:bg-slate-900/80 transition-all"
            >
              {/* Color preview */}
              <button
                type="button"
                className="relative h-11 w-11 shrink-0 rounded-xl border-2 border-white/20 overflow-hidden bg-white/5 hover:border-white/40 transition-colors"
                style={{ backgroundColor: it.color }}
                onClick={() => {
                  const input = document.getElementById(`color-${idx}`) as HTMLInputElement
                  input?.click()
                }}
              >
                <input
                  id={`color-${idx}`}
                  type="color"
                  value={it.color}
                  onChange={(e) => update(idx, { color: e.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </button>

              {/* Name input + hint */}
              <div className="flex-1 min-w-0 space-y-1">
                <input
                  placeholder={`Kategorie ${idx + 1}`}
                  value={it.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  className="w-full h-11 rounded-lg border border-white/10 bg-slate-950/60 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
                />
                <p className="text-[11px] text-slate-500">
                  Diese Kategorie wird im Kreis und in Listen angezeigt.
                </p>
              </div>

              {/* Delete button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(idx)}
                disabled={items.length <= 1}
                className="h-10 w-10 shrink-0 text-slate-500 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={add}
              disabled={items.length >= 5}
              className="h-10 gap-1.5 rounded-lg border-dashed border-slate-600 bg-transparent text-slate-200 hover:border-violet-500/60 hover:bg-violet-500/10 hover:text-violet-100 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Kategorie
            </Button>
            <span className="text-xs text-slate-500">{items.length}/5 Kategorien</span>
          </div>

          <Button
            onClick={onSave}
            size="sm"
            className="h-10 gap-2 rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 px-4 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:via-fuchsia-400 hover:to-sky-400 hover:shadow-violet-500/35"
          >
            <Save className="h-4 w-4" />
            Speichern
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
