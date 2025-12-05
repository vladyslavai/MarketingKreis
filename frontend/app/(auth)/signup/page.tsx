"use client"

import { Suspense, useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, Eye, EyeOff, UserPlus, Sparkles, CheckCircle2, XCircle, Info } from "lucide-react"

export const dynamic = "force-dynamic"

function SignupInner() {
  const params = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  const token = (params?.get?.("token") as string) || ""

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" }
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    
    if (score <= 1) return { score, label: "Schwach", color: "bg-red-500" }
    if (score <= 2) return { score, label: "Mittel", color: "bg-amber-500" }
    if (score <= 3) return { score, label: "Gut", color: "bg-emerald-500" }
    return { score, label: "Stark", color: "bg-green-400" }
  }, [password])

  const passwordsMatch = password && confirmPassword && password === confirmPassword

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage("Passwörter stimmen nicht überein")
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "https://kreismarketing-backend.onrender.com"
      const url = `${base.replace(/\/$/, "")}/auth/register`
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, token }),
        credentials: "include",
        cache: "no-store",
        mode: "cors",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data?.detail || data?.error || "Fehler bei der Registrierung")
        setSubmitting(false)
        return
      }
      setSuccess(true)
      setMessage("Konto erfolgreich erstellt! Sie werden weitergeleitet...")
      setTimeout(() => router.push("/signin"), 2000)
    } catch (e: any) {
      setMessage(e?.message || "Ein unerwarteter Fehler ist aufgetreten")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#060b1a]">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[550px] w-[550px] animate-pulse rounded-full bg-gradient-to-tr from-cyan-600/15 to-blue-600/15 blur-3xl" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] animate-pulse rounded-full bg-gradient-to-r from-rose-500/10 to-orange-500/10 blur-3xl" style={{ animationDelay: "2s" }} />
      </div>

      {/* Decorative grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 p-3 backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-violet-400" />
            </div>
            <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Marketing Kreis
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Erstellen Sie Ihr Konto und starten Sie durch
            </p>
          </div>

          {/* Card */}
          <Card className="w-full border-slate-800/50 bg-slate-900/70 text-slate-200 shadow-2xl shadow-violet-500/5 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserPlus className="h-5 w-5 text-violet-400" />
                Registrieren
              </CardTitle>
              <p className="text-sm text-slate-400">
                Füllen Sie das Formular aus, um ein Konto zu erstellen
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Messages */}
                {message && (
                  <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                    success 
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" 
                      : "border-red-500/30 bg-red-500/10 text-red-300"
                  }`}>
                    {success ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                    <span>{message}</span>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">E-Mail-Adresse</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      placeholder="name@beispiel.de"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-10 bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20 transition-colors"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Passwort</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      placeholder="Mindestens 8 Zeichen"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={(e: any) => setCapsLock(Boolean(e.getModifierState && e.getModifierState("CapsLock")))}
                      className="h-11 pl-10 pr-10 bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20 transition-colors"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password strength */}
                  {password && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= passwordStrength.score ? passwordStrength.color : "bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Passwortstärke: <span className={passwordStrength.score >= 3 ? "text-emerald-400" : passwordStrength.score >= 2 ? "text-amber-400" : "text-red-400"}>{passwordStrength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Passwort bestätigen</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      placeholder="Passwort wiederholen"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`h-11 pl-10 pr-10 bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20 transition-colors ${
                        confirmPassword && (passwordsMatch ? "border-emerald-500/50" : "border-red-500/50")
                      }`}
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-400">Passwörter stimmen nicht überein</p>
                  )}
                  {passwordsMatch && (
                    <p className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Passwörter stimmen überein
                    </p>
                  )}
                </div>

                {/* Caps Lock Warning */}
                {capsLock && (
                  <div className="flex items-center gap-2 text-xs text-amber-400">
                    <Info className="h-3.5 w-3.5" />
                    <span>Caps Lock ist aktiviert</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting || !passwordsMatch}
                  className="h-11 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none" />
                      </svg>
                      Wird erstellt...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Konto erstellen
                    </span>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-900/70 px-3 text-slate-500">oder</span>
                  </div>
                </div>

                {/* Sign In Link */}
                <div className="text-center">
                  <p className="text-sm text-slate-400">
                    Sie haben bereits ein Konto?{" "}
                    <Link
                      href="/signin"
                      className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Jetzt anmelden
                    </Link>
                  </p>
                </div>

                {/* Terms */}
                <p className="pt-4 text-center text-xs text-slate-500">
                  Mit der Registrierung stimmen Sie unseren{" "}
                  <Link href="#" className="underline hover:text-slate-300 transition-colors">
                    AGB
                  </Link>{" "}
                  und der{" "}
                  <Link href="#" className="underline hover:text-slate-300 transition-colors">
                    Datenschutzerklärung
                  </Link>{" "}
                  zu.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} Marketing Kreis. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#060b1a]">
        <div className="flex items-center gap-2 text-slate-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none" />
          </svg>
          <span>Laden...</span>
        </div>
      </div>
    }>
      <SignupInner />
    </Suspense>
  )
}
