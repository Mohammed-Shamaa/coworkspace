'use client'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import DashboardCard from '@/components/dashboard-card'
import MemberForm from '@/components/member-form'
import { dashboardApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Dashboard } from '@/types'

export default function DashboardHome() {
  const { t } = useTranslation()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setError(null)
    dashboardApi.get().then(res => setDashboard(res.data)).catch(err => {
      const msg = err.response?.data?.error || err.message || 'Failed to load dashboard'
      setError(msg)
      console.error(err)
    })
  }, [refreshKey])

  const cards: { label: string; value: string | number; bgColor: string; textColor: string; prefix?: string }[] = dashboard ? [
    { label: t('dashboard.students'), value: dashboard.studentCount, bgColor: '#E3F2FD', textColor: '#1565C0' },
    { label: t('dashboard.remoteWorkers'), value: dashboard.remoteWorkerCount, bgColor: '#E8F5E9', textColor: '#2E7D32' },
    { label: t('dashboard.unpaidMembers'), value: dashboard.unpaidMembers, bgColor: '#FFF3E0', textColor: '#E65100' },
    { label: t('dashboard.monthlyIncome'), value: dashboard.monthlyIncome.toFixed(2), bgColor: '#F3E5F5', textColor: '#6A1B9A', prefix: '$' },
    { label: t('dashboard.expiredMembers'), value: dashboard.expiredMembers, bgColor: '#FFEBEE', textColor: '#C62828' },
  ] : []

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('dashboard.title')}</h1>
        <p className="text-[var(--text-secondary)] mb-6">{t('dashboard.subtitle')}</p>
        <div className="bg-[var(--error-bg)] text-[var(--error-text)] p-4 rounded-lg border border-red-200">
          <p className="font-semibold">{t('dashboard.error') || 'Failed to load dashboard'}</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="mt-3 px-4 py-2 bg-[#1565C0] text-white rounded hover:bg-[#1976D2] text-sm cursor-pointer"
          >
            {t('common.retry') || 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('dashboard.title')}</h1>
      <p className="text-[var(--text-secondary)] mb-6">{t('dashboard.subtitle')}</p>

      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.overview')}</h2>
        <div className="grid grid-cols-5 gap-4">
          {cards.map((card, i) => (
            <DashboardCard key={i} {...card} />
          ))}
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-5">{t('dashboard.registerNewMember')}</h2>
        <MemberForm onSuccess={() => setRefreshKey(k => k + 1)} />
      </div>

      {dashboard && dashboard.recentRegistrations.length > 0 && (
        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-5 mt-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.recentRegistrations')}</h2>
          <div className="space-y-2">
            {dashboard.recentRegistrations.slice(0, 5).map((reg) => (
              <div key={reg.id} className="flex items-center justify-between py-2 border-b border-[var(--card-border)] last:border-0">
                <div>
                  <span className="font-medium text-[var(--text-primary)]">{reg.fullName}</span>
                  <span className="text-xs text-[var(--text-secondary)] ml-2">
                    ({reg.memberType === 'RemoteWorker' ? t('dashboard.worker') : reg.memberType})
                  </span>
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {formatDate(reg.registrationDate)} - {formatCurrency(reg.monthlyFee)}{t('dashboard.perMonth')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
