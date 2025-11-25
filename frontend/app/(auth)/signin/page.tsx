"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, Eye, EyeOff, Chrome, Info } from "lucide-react"

function SignInInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("mk_remember_email")
    if (saved) {
      setEmail(saved)
      setRemember(true)
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Login failed')
      }
      if (remember) localStorage.setItem("mk_remember_email", email); else localStorage.removeItem("mk_remember_email")
      const next = params?.get('next')
      const redirectTo = next || res.headers.get('X-Redirect-To') || '/dashboard'
      router.push(redirectTo)
    } catch (e: any) {
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#060b1a]">
      {/* Decorative radial glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-red-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-600/15 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">Marketing Kreis</h1>
            <p className="mt-1 text-sm text-slate-400">Bitte anmelden, um fortzufahren</p>
          </div>
          <Card className="w-full border-slate-800 bg-slate-900/80 text-slate-200 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Anmelden</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-red-300 text-sm">{error}</div>}

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    className="pl-9 bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Passwort"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    onKeyUp={(e:any)=> setCapsLock(Boolean(e.getModifierState && e.getModifierState('CapsLock')))}
                    className="pl-9 pr-10 bg-slate-900/60 border-slate-700 text-slate-200 placeholder:text-slate-400"
                    required
                  />
                  <button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-200">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {capsLock && (
                  <div className="flex items-center gap-2 text-xs text-amber-300"><Info className="h-3.5 w-3.5" />Caps Lock ist aktiv</div>
                )}

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-900" />
                    <span>Angemeldet bleiben</span>
                  </label>
                  <Link href="#" className="text-slate-300 hover:text-white">Passwort vergessen?</Link>
                </div>

                <Button type="submit" disabled={loading} className="button-glow w-full bg-blue-600 hover:bg-blue-500">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" opacity="0.25"/><path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="4" fill="none"/></svg>
                      Einloggen...
                    </span>
                  ) : 'Einloggen'}
                </Button>

                <div className="flex items-center justify-between gap-2">
                  <Button type="button" variant="outline" className="flex-1 border-slate-700 bg-slate-900/40 hover:bg-slate-800" onClick={()=>{setEmail('admin@marketingkreis.ch');setPassword('admin123')}}>
                    Demo füllen
                  </Button>
                  <Button type="button" variant="outline" className="hidden sm:flex flex-1 border-slate-700 bg-slate-900/40 hover:bg-slate-800" onClick={()=>alert('Google Sign-In ist noch nicht konfiguriert') }>
                    <Chrome className="h-4 w-4 mr-2"/>
                    Google
                  </Button>
                </div>

                <p className="text-center text-xs text-slate-500 pt-2">Mit der Anmeldung stimmen Sie unseren <Link href="#" className="underline hover:text-slate-300">AGB</Link> und der <Link href="#" className="underline hover:text-slate-300">Datenschutzerklärung</Link> zu.</p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInInner />
    </Suspense>
  )
}


