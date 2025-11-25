"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserCategories } from "@/hooks/use-user-categories"

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
      <Card className="backdrop-blur-md bg-white/70 dark:bg-neutral-900/40 border border-white/20 dark:border-neutral-800/40 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Kategorien einrichten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  placeholder={`Kategorie #${idx + 1}`}
                  value={it.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  className="flex-1 h-10 rounded-md bg-slate-900/60 border border-slate-700 px-3 text-slate-200 placeholder:text-slate-400"
                />
                <input
                  type="color"
                  value={it.color}
                  onChange={(e) => update(idx, { color: e.target.value })}
                  className="h-10 w-14 rounded-md bg-transparent border border-slate-700"
                />
                <Button variant="outline" size="sm" onClick={() => remove(idx)} disabled={items.length <= 1}>Entfernen</Button>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={add} disabled={items.length >= 5}>+ Kategorie</Button>
              <Button onClick={onSave} className="bg-gradient-to-r from-red-500 to-blue-500 text-white">Speichern</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}


