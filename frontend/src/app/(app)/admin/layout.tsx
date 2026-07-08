'use client'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin } = useAuth()
  const { t } = useTranslation()

  if (!isSuperAdmin) return <>{children}</>

  return <>{children}</>
}
