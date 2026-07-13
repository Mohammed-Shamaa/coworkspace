'use client'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AuthGuard } from '@/components/auth-guard'
import { LanguageProvider } from '@/lib/language-provider'
import Sidebar from '@/components/sidebar'
import ErrorBoundary from '@/components/error-boundary'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { setupApi } from '@/lib/api'
import NotificationBell from '@/components/notification-bell'

function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user, tenant } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const routerRef = useRef(router)

  useEffect(() => { routerRef.current = router }, [router])

  const checkedRef = useRef(false)

  useEffect(() => {
    if (loading || !isAuthenticated) return
    if (checkedRef.current) return
    checkedRef.current = true

    // SuperAdmin goes straight to admin dashboard
    if (user?.role === 'SuperAdmin') {
      if (pathname !== '/admin' && !pathname.startsWith('/admin')) {
        routerRef.current.push('/admin')
      }
      return
    }

    // Non-SuperAdmin: check rejection status (highest priority)
    if (tenant?.status === 'Rejected') {
      if (pathname !== '/account-rejected') {
        routerRef.current.push('/account-rejected')
      }
      return
    }

    // Non-SuperAdmin: check lock status
    if (tenant?.isLocked) {
      if (pathname !== '/account-locked') {
        routerRef.current.push('/account-locked')
      }
      return
    }

    // Non-SuperAdmin: check subscription status first
    if (tenant?.paymentStatus === 'Expired' || tenant?.paymentStatus === 'Suspended') {
      if (pathname !== '/subscription-expired') {
        routerRef.current.push('/subscription-expired')
      }
      return
    }

    const check = async () => {
      try {
        const res = await setupApi.getStatus()
        if (!res.data.onboardingCompleted) {
          routerRef.current.push('/onboarding')
          return
        }
        // Onboarding complete — check approval status
        if (tenant?.status === 'Pending' && pathname !== '/pending-approval') {
          routerRef.current.push('/pending-approval')
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: Record<string, unknown> }; message?: string }
        const status = axiosErr?.response?.status
        if (status === 429) return
        console.warn(`[OnboardingCheck] Status check failed (${status || 'no response'}):`, axiosErr?.response?.data || axiosErr?.message || axiosErr)
      }
    }
    check()
  }, [isAuthenticated, loading, pathname, user?.role, tenant?.status, tenant?.paymentStatus])

  return <>{children}</>
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AuthGuard>
      <LanguageProvider>
        <OnboardingCheck>
          <div className="flex min-h-screen bg-[var(--page-bg)]">
            <Sidebar />
            <main className="flex-1 p-3 md:p-6 overflow-auto relative">
              {pathname !== '/analytics' && (
                <div className="absolute top-3 md:top-6 right-3 md:right-6 z-30">
                  <NotificationBell />
                </div>
              )}
              <ErrorBoundary>
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </ErrorBoundary>
            </main>
          </div>
        </OnboardingCheck>
      </LanguageProvider>
    </AuthGuard>
  )
}
