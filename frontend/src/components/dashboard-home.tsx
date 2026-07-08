'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import DashboardCard from '@/components/dashboard-card'
import MemberForm from '@/components/member-form'
import { useAuth } from '@/lib/auth-context'
import { dashboardApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Dashboard } from '@/types'

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000

function isRetryable(status: number | undefined): boolean {
  if (!status) return true
  if (status >= 500) return true
  return false
}

export default function DashboardHome() {
  const { t } = useTranslation()
  const { loading: authLoading } = useAuth()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!mountedRef.current) return

    let ignore = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await dashboardApi.get()
        if (!ignore) {
          setDashboard(res.data)
          retryCountRef.current = 0
        }
      } catch (err: unknown) {
        if (!ignore) {
          const axiosErr = err as { response?: { status: number; data?: { message?: string; error?: string } }; message?: string }
          const status = axiosErr.response?.status

          if (status === 401) return

          if (isRetryable(status) && retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++
            retryTimer = setTimeout(fetchData, RETRY_DELAY_MS)
            return
          }

          const errMsg = axiosErr.response?.data?.message
            || axiosErr.response?.data?.error
            || (status ? `Server error (${status})` : 'Network error')
          setError(errMsg)
        }
      }
      if (!ignore) setLoading(false)
    }

    fetchData()
    return () => {
      ignore = true
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [authLoading, refreshKey])

  const cards = useMemo(() => dashboard ? [
    { label: t('dashboard.students'), value: dashboard.studentCount, bgColor: '#EFF6FF', textColor: '#1565C0' },
    { label: t('dashboard.remoteWorkers'), value: dashboard.remoteWorkerCount, bgColor: '#F0FDF4', textColor: '#15803D' },
    { label: t('dashboard.unpaidMembers'), value: dashboard.unpaidMembers, bgColor: '#FFFBEB', textColor: '#D97706' },
    { label: t('dashboard.monthlyIncome'), value: dashboard.monthlyIncome?.toFixed(2) ?? '—', bgColor: '#F5F3FF', textColor: '#7C3AED', prefix: '$' },
    { label: t('dashboard.expiredMembers'), value: dashboard.expiredMembers, bgColor: '#FEF2F2', textColor: '#DC2626' },
  ] : [], [dashboard])

  const cards1 = cards.slice(0, Math.ceil(cards.length / 2))
  const cards2 = cards.slice(Math.ceil(cards.length / 2))

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('dashboard.title')}</h1>
        <p className="text-[var(--text-secondary)] mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
            <div className="w-5 h-5 border-2 border-[var(--input-focus)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-secondary)]">{t('common.loading')}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-[var(--error-bg)] text-[var(--error-text)] p-5 rounded-xl border border-orange-200/50 mb-6 shadow-sm">
          <p className="font-semibold">{t('errors.generic')}</p>
          <p className="text-sm mt-1 opacity-90">{error}</p>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="mt-3 px-5 py-2 bg-[var(--error-text)] text-white rounded-lg hover:brightness-110 text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {dashboard && (
        <div className="card-premium p-5 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5">{t('dashboard.overview')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {cards.map((card, i) => (
              <DashboardCard key={i} {...card} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-5">{t('dashboard.registerNewMember')}</h2>
          <MemberForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>

        {dashboard && dashboard.recentRegistrations && dashboard.recentRegistrations.length > 0 && (
          <div className="card-premium p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.recentRegistrations')}</h2>
            <div className="space-y-1">
              {dashboard.recentRegistrations.slice(0, 5).map((reg, idx) => (
                <div key={reg.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-3 rounded-xl transition-all duration-150 hover:bg-[var(--hover-bg)] gap-1 animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="min-w-0">
                    <span className="font-medium text-[var(--text-primary)] truncate block">{reg.fullName}</span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      ({reg.memberType === 'RemoteWorker' ? t('dashboard.worker') : reg.memberType})
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-muted)] shrink-0">
                    {formatDate(reg.registrationDate)} &middot; {formatCurrency(reg.monthlyFee)}{t('dashboard.perMonth')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
