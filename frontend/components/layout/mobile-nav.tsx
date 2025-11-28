"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, CalendarDays, ActivitySquare, FileBarChart } from "lucide-react"

const items = [
  { href: "/dashboard", label: "Home", Icon: LayoutDashboard },
  { href: "/crm", label: "CRM", Icon: Building2 },
  { href: "/calendar", label: "Cal", Icon: CalendarDays },
  { href: "/activities", label: "Acts", Icon: ActivitySquare },
  { href: "/reports", label: "Rpt", Icon: FileBarChart },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav
      className="
        md:hidden fixed bottom-0 left-0 right-0 z-[60]
        backdrop-blur-xl bg-white/80 dark:bg-slate-900/80
        border-t border-slate-200 dark:border-slate-800
      "
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
      }}
    >
      <ul className="mx-auto max-w-[640px] grid grid-cols-5 gap-1 px-3 py-2">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <li key={href} className="flex justify-center">
              <Link
                href={href}
                className={`
                  inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-xs font-medium
                  ${active
                    ? "text-slate-900 dark:text-white bg-slate-900/5 dark:bg-white/5"
                    : "text-slate-500 dark:text-slate-400"}
                `}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={`h-5 w-5 mb-0.5 ${active ? "text-slate-900 dark:text-white" : ""}`} />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}


