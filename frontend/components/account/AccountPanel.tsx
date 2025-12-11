"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sun, Moon, MonitorCog, Shield, LogOut } from "lucide-react"

type Mode = "auto" | "light" | "dark"

interface AccountPanelProps {
  onClose: () => void
}

export function AccountPanel({ onClose }: AccountPanelProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mode, setMode] = React.useState<Mode>("auto")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    try {
      const saved = (localStorage.getItem("themeMode") as Mode | null) || "auto"
      applyMode(saved, false)
    } catch {
      applyMode("auto", false)
    }
  }, [])

  const applyMode = (m: Mode, persist = true) => {
    setMode(m)
    if (persist) {
      try {
        localStorage.setItem("themeMode", m)
      } catch {}
    }
    if (typeof window === "undefined") return
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = m === "dark" || (m === "auto" && prefersDark)
    document.documentElement.classList.toggle("dark", isDark)
    document.documentElement.setAttribute("data-theme-mode", m)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      onClose()
      if (typeof window !== "undefined") {
        window.location.href = "/signup?mode=login"
      } else {
        router.replace("/signup?mode=login")
      }
    }
  }

  const isAdmin = user?.role === "admin"
  const initial = (user?.email || "A").trim().charAt(0).toUpperCase()

  return (
    <div className="space-y-6">
      {/* Top: avatar + basic info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-kaboom-red to-red-600 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
            {initial}
          </div>
          <div>
            <div className="text-sm text-slate-400">Angemeldet als</div>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-50 truncate max-w-[260px]">
              {user?.email || "Unbekannter Benutzer"}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge className="border-transparent bg-slate-900/80 text-slate-100 dark:bg-slate-100/10 dark:text-slate-100">
                Rolle: {user?.role || "user"}
              </Badge>
              {isAdmin && (
                <Badge className="border-transparent bg-emerald-600/90 text-white inline-flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              className="glass-card h-9 text-xs sm:text-sm"
              onClick={() => {
                router.push("/admin")
                onClose()
              }}
            >
              <Shield className="h-4 w-4 mr-2" /> Admin‑Bereich öffnen
            </Button>
          )}
          <Button
            variant="outline"
            className="h-9 text-xs sm:text-sm border-red-500/40 text-red-500 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" /> Abmelden
          </Button>
        </div>
      </div>

      {/* Settings sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme / appearance */}
        <div className="rounded-2xl border border-white/15 bg-white/70 dark:bg-slate-900/60 p-4 space-y-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Darstellung</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Steuern Sie Modus und Verhalten der Oberfläche.
            </div>
          </div>
          {mounted && (
            <div className="flex flex-wrap gap-2">
              {[
                { value: "auto" as Mode, label: "Auto", Icon: MonitorCog },
                { value: "light" as Mode, label: "Hell", Icon: Sun },
                { value: "dark" as Mode, label: "Dunkel", Icon: Moon },
              ].map(({ value, label, Icon }) => {
                const active = mode === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => applyMode(value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-slate-900 text-slate-50 border-slate-700 shadow-sm"
                        : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>
          )}
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Der Modus wird pro Browser gespeichert. <span className="font-medium">Auto</span> folgt den Systemeinstellungen.
          </div>
        </div>

        {/* Security / upcoming features */}
        <div className="rounded-2xl border border-white/15 bg-white/70 dark:bg-slate-900/60 p-4 space-y-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Sicherheit</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Passwort & Sitzungen – bald vollständig konfigurierbar.
            </div>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <li>• Passwort‑Änderung direkt aus dem Account (coming soon)</li>
            <li>• Übersicht der letzten Logins & aktiven Sitzungen</li>
            <li>• Optional 2‑Faktor‑Authentifizierung</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


