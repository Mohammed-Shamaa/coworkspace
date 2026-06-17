'use client'
import { useEffect, useRef } from 'react'
import { ThemeProvider } from '@/lib/theme-provider'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { AuthGuard } from '@/components/auth-guard'
import { LanguageProvider } from '@/lib/language-provider'
import Sidebar from '@/components/sidebar'
import ErrorBoundary from '@/components/error-boundary'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { setupApi } from '@/lib/api'

function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const routerRef = useRef(router)

  useEffect(() => { routerRef.current = router }, [router])

  const checkedRef = useRef(false)

  useEffect(() => {
    if (loading || !isAuthenticated || pathname === '/onboarding') return
    if (checkedRef.current) return
    checkedRef.current = true

    const check = async () => {
      try {
        const res = await setupApi.getStatus()
        if (!res.data.onboardingCompleted) {
          routerRef.current.push('/onboarding')
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: Record<string, unknown> }; message?: string }
        const status = axiosErr?.response?.status
        if (status === 429) return
        console.warn(`[OnboardingCheck] Status check failed (${status || 'no response'}):`, axiosErr?.response?.data || axiosErr?.message || axiosErr)
      }
    }
    check()
  }, [isAuthenticated, loading, pathname])

  return <>{children}</>
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <LanguageProvider>
            <OnboardingCheck>
              <div className="flex min-h-screen bg-[var(--page-bg)]">
                <Sidebar />
                <main className="flex-1 p-6 overflow-auto">
                  <ErrorBoundary>
                    <AnimatePresence mode="wait">
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
      </AuthProvider>
    </ThemeProvider>
  )
}
