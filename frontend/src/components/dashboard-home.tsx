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
  if (!status) return true // network error
  if (status >= 500) return true // server error
  return false // 4xx, 3xx, etc. are not transient
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

          // 401 = auth expired → hard redirect already handled by interceptor
          if (status === 401) return

          // Only retry transient errors (network, 5xx); never retry 4xx
          if (isRetryable(status) && retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++
            retryTimer = setTimeout(fetchData, RETRY_DELAY_MS)
            return
          }

          // Use the server-provided message, fall back gracefully
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

  const cards: { label: string; value: string | number; bgColor: string; textColor: string; prefix?: string }[] = useMemo(() => dashboard ? [
    { label: t('dashboard.students'), value: dashboard.studentCount, bgColor: '#E3F2FD', textColor: '#1565C0' },
    { label: t('dashboard.remoteWorkers'), value: dashboard.remoteWorkerCount, bgColor: '#E8F5E9', textColor: '#2E7D32' },
    { label: t('dashboard.unpaidMembers'), value: dashboard.unpaidMembers, bgColor: '#FFF3E0', textColor: '#E65100' },
    { label: t('dashboard.monthlyIncome'), value: dashboard.monthlyIncome?.toFixed(2) ?? '—', bgColor: '#F3E5F5', textColor: '#6A1B9A', prefix: '$' },
    { label: t('dashboard.expiredMembers'), value: dashboard.expiredMembers, bgColor: '#FFEBEE', textColor: '#C62828' },
  ] : [], [dashboard])

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('dashboard.title')}</h1>
      <p className="text-[var(--text-secondary)] mb-6">{t('dashboard.subtitle')}</p>

      {loading && (
        <div className="text-center py-8 text-[var(--text-secondary)]">{t('common.loading')}</div>
      )}

      {error && (
        <div className="bg-[var(--error-bg)] text-[var(--error-text)] p-4 rounded-lg border border-red-200 mb-6">
          <p className="font-semibold">{t('dashboard.error') || 'Failed to load dashboard'}</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="mt-3 px-4 py-2 bg-[#1565C0] text-white rounded hover:bg-[#1976D2] text-sm cursor-pointer"
          >
            {t('common.retry') || 'Retry'}
          </button>
        </div>
      )}

      {dashboard && (
        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-5 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.overview')}</h2>
          <div className="grid grid-cols-5 gap-4">
            {cards.map((card, i) => (
              <DashboardCard key={i} {...card} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-5">{t('dashboard.registerNewMember')}</h2>
        <MemberForm onSuccess={() => setRefreshKey(k => k + 1)} />
      </div>

      {dashboard && dashboard.recentRegistrations && dashboard.recentRegistrations.length > 0 && (
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
