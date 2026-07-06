'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Shield, Users, Building2, CreditCard, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import type { AdminStats } from '@/types'

export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    if (!isSuperAdmin) return
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats()
        setStats(res.data.data)
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
        setError(axiosErr.response?.data?.message || axiosErr.message || t('admin.error.failedToLoad'))
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [isSuperAdmin])

  if (!isSuperAdmin) {
    return <div className="text-center py-20 text-[var(--text-secondary)]">{t('admin.accessDenied')}</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-20 text-[#C62828]">{error}</div>
  }

  const cards = [
    { label: t('admin.dashboard.totalTenants'), value: stats?.totalTenants ?? 0, icon: Building2, color: 'bg-blue-500' },
    { label: t('admin.dashboard.pendingApproval'), value: stats?.pendingTenants ?? 0, icon: Clock, color: 'bg-amber-500' },
    { label: t('admin.dashboard.approved'), value: stats?.approvedTenants ?? 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: t('admin.dashboard.rejected'), value: stats?.rejectedTenants ?? 0, icon: XCircle, color: 'bg-red-500' },
    { label: t('admin.dashboard.activeSubscriptions'), value: stats?.activeSubscriptions ?? 0, icon: CreditCard, color: 'bg-purple-500' },
    { label: t('admin.dashboard.trial'), value: stats?.trialTenants ?? 0, icon: Clock, color: 'bg-teal-500' },
    { label: t('admin.dashboard.totalMembers'), value: stats?.totalMembers ?? 0, icon: Users, color: 'bg-indigo-500' },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-[#1565C0]" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('admin.dashboard.title')}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-3">
              <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-xl font-bold text-[var(--text-primary)]">{card.value}</div>
              <div className="text-xs text-[var(--text-secondary)]">{card.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/pending" className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-5 hover:border-[#1565C0]/50 transition-colors block">
          <Clock className="w-5 h-5 text-amber-500 mb-2" />
          <h3 className="font-semibold text-[var(--text-primary)]">{t('admin.dashboard.pendingRequests')}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{t('admin.dashboard.workspacesAwaiting', { count: stats?.pendingTenants ?? 0 })}</p>
        </Link>
        <Link href="/admin/workspaces" className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-5 hover:border-[#1565C0]/50 transition-colors block">
          <Building2 className="w-5 h-5 text-blue-500 mb-2" />
          <h3 className="font-semibold text-[var(--text-primary)]">{t('admin.dashboard.activeWorkspaces')}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{t('admin.dashboard.approvedWorkspaces', { count: stats?.approvedTenants ?? 0 })}</p>
        </Link>
        <Link href="/admin/payments" className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-5 hover:border-[#1565C0]/50 transition-colors block">
          <CreditCard className="w-5 h-5 text-purple-500 mb-2" />
          <h3 className="font-semibold text-[var(--text-primary)]">{t('admin.dashboard.payments')}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{t('admin.dashboard.activeSubs', { count: stats?.activeSubscriptions ?? 0 })}</p>
        </Link>
      </div>
    </div>
  )
}
