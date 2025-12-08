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
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/30">
          <Palette className="h-5 w-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-100">Kategorien einrichten</h3>
          <p className="mt-0.5 text-sm text-slate-400 leading-snug">
            Bis zu 5 Kategorien für den Marketing-Kreis definieren
          </p>
        </div>
      </div>

      {/* Categories list */}
      <div className="space-y-2.5">
        {items.map((it, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, delay: idx * 0.04 }}
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-3 hover:border-violet-500/30 hover:bg-slate-900/70 transition-all"
          >
            {/* Color preview */}
            <button
              type="button"
              className="relative h-10 w-10 shrink-0 rounded-lg border-2 border-white/20 overflow-hidden hover:border-white/40 transition-colors"
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

            {/* Name input */}
            <input
              placeholder={`Kategorie ${idx + 1}`}
              value={it.name}
              onChange={(e) => update(idx, { name: e.target.value })}
              className="flex-1 h-10 min-w-0 rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />

            {/* Delete button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove(idx)}
              disabled={items.length <= 1}
              className="h-10 w-10 shrink-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={add}
            disabled={items.length >= 5}
            className="h-9 gap-1.5 border-dashed border-slate-600 bg-transparent text-slate-300 hover:border-violet-500/60 hover:bg-violet-500/10 hover:text-violet-200 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Hinzufügen
          </Button>
          <span className="text-xs text-slate-500">
            {items.length}/5
          </span>
        </div>

        <Button
          onClick={onSave}
          size="sm"
          className="h-9 gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/20 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/30"
        >
          <Save className="h-4 w-4" />
          Speichern
        </Button>
      </div>
    </motion.div>
  )
}
