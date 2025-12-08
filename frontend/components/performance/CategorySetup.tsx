"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useUserCategories } from "@/hooks/use-user-categories"
import { Plus, Save, Trash2 } from "lucide-react"

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
    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"]
    setItems([...items, { name: "", color: colors[items.length] || "#8b5cf6" }])
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
    <div className="space-y-4">
      {/* Category list */}
      <div className="space-y-3">
        {items.map((it, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: idx * 0.03 }}
            className="flex items-center gap-3"
          >
            {/* Color picker */}
            <div className="relative shrink-0">
              <div
                className="h-11 w-11 rounded-xl border-2 border-white/20 cursor-pointer hover:border-white/40 transition-colors shadow-sm"
                style={{ backgroundColor: it.color }}
                onClick={() => document.getElementById(`color-picker-${idx}`)?.click()}
              />
              <input
                id={`color-picker-${idx}`}
                type="color"
                value={it.color}
                onChange={(e) => update(idx, { color: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Name input */}
            <input
              placeholder={`Kategorie ${idx + 1}`}
              value={it.name}
              onChange={(e) => update(idx, { name: e.target.value })}
              className="flex-1 h-11 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/60 focus:bg-slate-900/80 transition-all"
            />

            {/* Delete button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove(idx)}
              disabled={items.length <= 1}
              className="h-11 w-11 shrink-0 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={add}
          disabled={items.length >= 5}
          className="h-10 gap-2 rounded-xl border-dashed border-slate-600 text-slate-400 hover:border-violet-500/60 hover:text-violet-300 hover:bg-violet-500/10 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          <span>Kategorie</span>
          <span className="ml-1 text-xs opacity-60">{items.length}/5</span>
        </Button>

        <Button
          onClick={onSave}
          size="sm"
          className="h-10 gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-500"
        >
          <Save className="h-4 w-4" />
          Speichern
        </Button>
      </div>
    </div>
  )
}
