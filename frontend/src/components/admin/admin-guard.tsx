'use client'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    } else if (!loading && isAuthenticated && !isSuperAdmin) {
      router.push('/dashboard')
    }
  }, [loading, isAuthenticated, isSuperAdmin, router])

  if (loading || !isAuthenticated || !isSuperAdmin) return null

  return <>{children}</>
}
