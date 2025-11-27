"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ModalProvider } from "@/components/ui/modal/ModalProvider"
import ChatWidget from "@/components/chat/chat-widget"
import { sync } from "@/lib/sync"
import CommandPalette from "@/components/command-palette"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const toggleSidebar = () => setSidebarCollapsed((v) => !v)

  // react to feature flags
  useEffect(() => {
    const read = () => {
      try { return JSON.parse(localStorage.getItem("featureFlags") || "{}") } catch { return {} }
    }
    const apply = (ff: Record<string, boolean>) => {
      setFlags(ff)
      if (ff.compactSidebar) {
        setSidebarCollapsed(true)
      }
      try {
        document.documentElement.classList.toggle('mk-reduced-motion', !!ff.reducedMotion)
      } catch {}
    }
    apply(read())
    const onStorage = (e: StorageEvent) => {
      if (e.key === "featureFlags") {
        try { apply(JSON.parse(e.newValue || "{}")) } catch {}
      }
    }
    const onCustom = () => apply(read())
    window.addEventListener("storage", onStorage)
    window.addEventListener("mk:flags", onCustom as any)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("mk:flags", onCustom as any)
    }
  }, [])

  // Auto refresh (global)
  useEffect(() => {
    let id: any
    if (flags.autoRefresh) {
      id = setInterval(() => {
        try { sync.refreshAll() } catch {}
      }, 60_000)
    }
    return () => { if (id) clearInterval(id) }
  }, [flags.autoRefresh])

  const bgStyle = useMemo(() => {
    if (!flags.gridBackground) return undefined
    const line = 'rgba(148,163,184,0.12)'
    const lineDark = 'rgba(255,255,255,0.06)'
    return {
      backgroundImage: `
        linear-gradient(to right, var(--mk-grid-color, ${line}) 1px, transparent 1px),
        linear-gradient(to bottom, var(--mk-grid-color, ${line}) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px',
    } as React.CSSProperties
  }, [flags.gridBackground])

  return (
    <ModalProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950" style={bgStyle}>
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[70] md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="close-mobile-menu"
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">
              {/* Reuse Sidebar at full width for mobile */}
              <Sidebar isCollapsed={false} onToggle={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div 
          className={`
            transition-all duration-300 ease-in-out
            ml-0
            ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
          `}
        >
          {/* DEV ribbon */}
          {flags.devRibbon && (
            <div className="fixed right-3 top-3 z-[60] select-none">
              <div className="rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white text-xs font-semibold px-3 py-1 shadow-lg">
                DEV
              </div>
            </div>
          )}
          {/* Header */}
          <Header onMenuClick={() => setMobileMenuOpen(true)} />

          {/* Page Content */}
          <main className="p-4 md:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
          <ChatWidget />
          <CommandPalette />
        </div>
      </div>
    </ModalProvider>
  )
}







