\"use client\"

import { useEffect } from \"react\"
import { useRouter, useSearchParams } from \"next/navigation\"

export default function SignInRedirectPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const next = params?.get?.(\"next\") as string | null
    const target = next ? `/signup?mode=login&next=${encodeURIComponent(next)}` : \"/signup?mode=login\"
    router.replace(target)
  }, [router, params])

  return null
}



