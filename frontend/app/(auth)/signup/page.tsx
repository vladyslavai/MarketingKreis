\"use client\"
import { useState } from \"react\"
import { useRouter, useSearchParams } from \"next/navigation\"

export default function SignupPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState(\"\")
  const [password, setPassword] = useState(\"\")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const token = params.get(\"token\") || \"\"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch(\"/api/auth/register\", {
        method: \"POST\",
        headers: { \"Content-Type\": \"application/json\" },
        body: JSON.stringify({ email, password, token }),
        credentials: \"include\",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data?.detail || data?.error || \"Fehler bei Registrierung\")
        setSubmitting(false)
        return
      }
      // If backend returned verify token (SMTP не настроен), покажем ссылку
      if (data?.verify?.token) {
        setMessage(\"Проверьте почту. Если письма нет, можно подтвердить по этой ссылке: /auth/verify?token=\" + data.verify.token)
      } else {
        setMessage(\"Проверьте почту для подтверждения адреса.\")
      }
    } catch (e: any) {
      setMessage(e?.message || \"Unexpected error\")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className=\"min-h-screen flex items-center justify-center p-6\">
      <form onSubmit={onSubmit} className=\"w-full max-w-sm bg-white/10 dark:bg-slate-900/60 border border-white/20 dark:border-slate-700 rounded-xl p-6 space-y-3\">
        <h1 className=\"text-xl font-semibold\">Sign up</h1>
        <input className=\"w-full rounded-md border px-3 py-2 bg-white/70 dark:bg-slate-900/60\" placeholder=\"Email\" type=\"email\" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input className=\"w-full rounded-md border px-3 py-2 bg-white/70 dark:bg-slate-900/60\" placeholder=\"Password\" type=\"password\" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button disabled={submitting} className=\"w-full rounded-md bg-slate-900 text-white py-2 disabled:opacity-50\">{submitting ? \"…\" : \"Create account\"}</button>
        {message && <p className=\"text-sm text-slate-600 dark:text-slate-300 break-all\">{message}</p>}
      </form>
    </div>
  )
}



