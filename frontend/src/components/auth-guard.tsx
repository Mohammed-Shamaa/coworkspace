'use client'
import { useEffect, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const routerRef = useRef(router)

  useEffect(() => { routerRef.current = router }, [router])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      routerRef.current.push('/auth/login')
    }
  }, [loading, isAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)]">
        <div className="text-[var(--text-primary)] text-xl font-semibold">{t('common.loading')}</div>
      </div>
    )
  }

  // If user is not authenticated we render a small non-blocking fallback
  // while the router redirect happens. Returning null produced a blank page
  // in some environments during navigation.
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)]">
        <div className="text-[var(--text-primary)] text-lg font-medium">{t('auth.redirecting') || 'Redirecting...'}</div>
      </div>
    )
  }

  return <>{children}</>
}
