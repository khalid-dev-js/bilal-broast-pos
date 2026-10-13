'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'

type AuthUser = { email?: string; role?: string }

function getUser(response: any): AuthUser | null {
  const user = response?.user || response?.data?.user || response?.data || response
  return user?.email ? user : null
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<'checking' | 'allowed'>('checking')

  useEffect(() => {
    let active = true
    setStatus('checking')
    api.get('/auth/me')
      .then((response) => {
        if (!active) return
        const user = getUser(response)
        if (!user) {
          router.replace(`/admin-login?next=${encodeURIComponent(pathname)}`)
          return
        }
        if (user.role !== 'admin') {
          router.replace('/menu')
          return
        }
        setStatus('allowed')
      })
      .catch(() => {
        if (active) router.replace(`/admin-login?next=${encodeURIComponent(pathname)}`)
      })
    return () => { active = false }
  }, [pathname, router])

  if (status !== 'allowed') {
    return <main className="admin-auth-loading" aria-live="polite"><div className="admin-auth-loader" /><p>Checking admin access…</p></main>
  }

  return <>{children}</>
}
