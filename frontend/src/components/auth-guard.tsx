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
  routerRef.current = router

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

  if (!isAuthenticated) return null

  return <>{children}</>
}
