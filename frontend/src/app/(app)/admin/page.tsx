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
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#1565C0]" />
          <span className="text-sm text-[var(--text-secondary)]">{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-block bg-[var(--error-bg)] text-[var(--error-text)] p-5 rounded-xl border border-orange-200/50 shadow-sm">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  const cards = [
    { label: t('admin.dashboard.totalTenants'), value: stats?.totalTenants ?? 0, icon: Building2, color: 'from-[#1565C0] to-[#0EA5E9]', bg: 'bg-blue-50' },
    { label: t('admin.dashboard.pendingApproval'), value: stats?.pendingTenants ?? 0, icon: Clock, color: 'from-[#F59E0B] to-[#FB923C]', bg: 'bg-amber-50' },
    { label: t('admin.dashboard.approved'), value: stats?.approvedTenants ?? 0, icon: CheckCircle, color: 'from-[#2E7D32] to-[#4ADE80]', bg: 'bg-green-50' },
    { label: t('admin.dashboard.rejected'), value: stats?.rejectedTenants ?? 0, icon: XCircle, color: 'from-[#DC2626] to-[#F87171]', bg: 'bg-red-50' },
    { label: t('admin.dashboard.activeSubscriptions'), value: stats?.activeSubscriptions ?? 0, icon: CreditCard, color: 'from-[#7C3AED] to-[#A78BFA]', bg: 'bg-purple-50' },
    { label: t('admin.dashboard.trial'), value: stats?.trialTenants ?? 0, icon: Clock, color: 'from-[#0D9488] to-[#2DD4BF]', bg: 'bg-teal-50' },
    { label: t('admin.dashboard.totalMembers'), value: stats?.totalMembers ?? 0, icon: Users, color: 'from-[#6366F1] to-[#818CF8]', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-[#1565C0] shadow-sm">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('admin.dashboard.title')}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t('admin.dashboard.subtitle') || 'SuperAdmin Control Panel'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`card-premium p-3 ${card.bg}`} style={{ borderColor: 'transparent' }}>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-2 shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-xl font-bold text-[var(--text-primary)]">{card.value}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">{card.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/admin/pending" className="card-premium p-5 hover:border-[var(--input-focus)]/30 transition-all duration-200 group block">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mb-3 text-amber-500 group-hover:scale-110 transition-transform duration-200">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">{t('admin.dashboard.pendingRequests')}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('admin.dashboard.workspacesAwaiting', { count: stats?.pendingTenants ?? 0 })}</p>
        </Link>
        <Link href="/admin/workspaces" className="card-premium p-5 hover:border-[var(--input-focus)]/30 transition-all duration-200 group block">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-3 text-blue-500 group-hover:scale-110 transition-transform duration-200">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">{t('admin.dashboard.activeWorkspaces')}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('admin.dashboard.approvedWorkspaces', { count: stats?.approvedTenants ?? 0 })}</p>
        </Link>
        <Link href="/admin/rejected" className="card-premium p-5 hover:border-[var(--input-focus)]/30 transition-all duration-200 group block">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mb-3 text-red-500 group-hover:scale-110 transition-transform duration-200">
            <XCircle className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">{t('admin.dashboard.rejectedApproval')}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('admin.dashboard.rejectedWorkspaces', { count: stats?.rejectedTenants ?? 0 })}</p>
        </Link>
        <Link href="/admin/payments" className="card-premium p-5 hover:border-[var(--input-focus)]/30 transition-all duration-200 group block">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mb-3 text-purple-500 group-hover:scale-110 transition-transform duration-200">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">{t('admin.dashboard.payments')}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('admin.dashboard.activeSubs', { count: stats?.activeSubscriptions ?? 0 })}</p>
        </Link>
      </div>
    </div>
  )
}
