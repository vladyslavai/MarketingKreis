"use client"
import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

function SignupInner() {
  const params = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const token = (params?.get?.("token") as string) || ""

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const controller = typeof window !== "undefined" ? new AbortController() : undefined
      const timeout = typeof window !== "undefined" ? window.setTimeout(() => controller?.abort(), 20000) : undefined
      // Всегда через наш серверный прокси, чтобы исключить CORS
      const url = "/api/auth/register"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, token }),
        credentials: "include",
        cache: "no-store",
        mode: "cors",
        signal: controller?.signal,
      })
      if (timeout) window.clearTimeout(timeout)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data?.detail || data?.error || "Fehler bei Registrierung")
        setSubmitting(false)
        return
      }
      // Фоллбек: просто предложить войти вручную (без автологина)
      setMessage("Аккаунт зарегистрирован. Войдите, пожалуйста.")
      setTimeout(() => router.push("/signin"), 1200)
    } catch (e: any) {
      setMessage(e?.message || "Unexpected error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white/10 dark:bg-slate-900/60 border border-white/20 dark:border-slate-700 rounded-xl p-6 space-y-3">
        <h1 className="text-xl font-semibold">Sign up</h1>
        <input className="w-full rounded-md border px-3 py-2 bg-white/70 dark:bg-slate-900/60" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input className="w-full rounded-md border px-3 py-2 bg-white/70 dark:bg-slate-900/60" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button disabled={submitting} className="w-full rounded-md bg-slate-900 text-white py-2 disabled:opacity-50">{submitting ? "…" : "Create account"}</button>
        {message && <p className="text-sm text-slate-600 dark:text-slate-300 break-all">{message}</p>}
      </form>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
      <SignupInner />
    </Suspense>
  )
}



