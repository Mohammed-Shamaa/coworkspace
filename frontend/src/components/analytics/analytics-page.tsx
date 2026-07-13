'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Users, CreditCard, TrendingUp, Layout, Calendar,
  UserCheck, UserX, GraduationCap, Briefcase, DollarSign,
} from 'lucide-react'
import '@/lib/i18n'
import { analyticsApi } from '@/lib/api'
import type { AnalyticsOverview, AnalyticsPeriod } from '@/types'
import KpiCard from './kpi-card'
import RevenueChart from './revenue-chart'
import MemberGrowthChart from './member-growth-chart'
import OccupancyChart from './occupancy-chart'
import PaymentStatusChart from './payment-status-chart'
import SubscriptionsChart from './subscriptions-chart'
import MeetingRoomChart from './meeting-room-chart'
import MemberActivityChart from './member-activity-chart'
import InsightsPanel from './insights-panel'
import DateRangeFilter from './date-range-filter'

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await analyticsApi.getOverview({ period })
      setData(res.data)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data?: { message?: string; error?: string } }; message?: string }
      const status = axiosErr.response?.status
      if (status === 401) return
      const errMsg = axiosErr.response?.data?.message
        || axiosErr.response?.data?.error
        || (status ? `Server error (${status})` : 'Network error')
      setError(errMsg)
    }
    setLoading(false)
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const kpis = useMemo(() => data ? [
    {
      label: t('analytics.totalMembers'),
      value: data.kpis.totalMembers,
      trend: data.kpis.membersTrend,
      icon: Users,
      colorClasses: 'bg-[#1565C0]',
    },
    {
      label: t('analytics.activeMembers'),
      value: data.kpis.activeMembers,
      icon: UserCheck,
      colorClasses: 'bg-[#2E7D32]',
    },
    {
      label: t('analytics.monthlyIncome'),
      value: data.kpis.monthlyIncome,
      icon: DollarSign,
      colorClasses: 'bg-[#7B1FA2]',
      isCurrency: true,
    },
    {
      label: t('analytics.totalRevenue'),
      value: data.kpis.totalRevenue,
      trend: data.kpis.revenueTrend,
      icon: TrendingUp,
      colorClasses: 'bg-[#1565C0]',
      isCurrency: true,
    },
    {
      label: t('analytics.occupancyRate'),
      value: data.kpis.occupancyRate,
      icon: Layout,
      colorClasses: 'bg-[#E65100]',
      suffix: '%',
    },
    {
      label: t('analytics.unpaidMembers'),
      value: data.kpis.unpaidMembers,
      icon: CreditCard,
      colorClasses: 'bg-[#C62828]',
    },
    {
      label: t('analytics.students'),
      value: data.kpis.studentCount,
      icon: GraduationCap,
      colorClasses: 'bg-[#1565C0]',
    },
    {
      label: t('analytics.workers'),
      value: data.kpis.remoteWorkerCount,
      icon: Briefcase,
      colorClasses: 'bg-[#2E7D32]',
    },
    {
      label: t('analytics.expiredMembers'),
      value: data.kpis.expiredMembers,
      icon: UserX,
      colorClasses: 'bg-[#C62828]',
    },
    {
      label: t('analytics.bookings'),
      value: data.kpis.totalMeetingRoomBookings,
      trend: data.kpis.meetingRoomTrend,
      icon: Calendar,
      colorClasses: 'bg-[#E65100]',
    },
    {
      label: t('analytics.occupiedDesks'),
      value: data.kpis.occupiedDesks,
      icon: Layout,
      colorClasses: 'bg-[#1565C0]',
    },
    {
      label: t('analytics.availableDesks'),
      value: data.kpis.availableDesks,
      icon: Layout,
      colorClasses: 'bg-[#2E7D32]',
    },
  ] : [], [data, t])

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('analytics.title')}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{t('analytics.subtitle')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('analytics.title')}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{t('analytics.subtitle')}</p>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
          <p className="font-semibold">{t('analytics.error')}</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-[#1565C0] text-white rounded-lg hover:bg-[#1976D2] text-sm cursor-pointer"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  if (!data || data.kpis.totalMembers === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('analytics.title')}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{t('analytics.subtitle')}</p>
          </div>
          <DateRangeFilter value={period} onChange={setPeriod} />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TrendingUp size={48} className="text-[var(--text-secondary)] mb-4 opacity-40" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('analytics.emptyTitle')}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md">{t('analytics.emptyDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('analytics.title')}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t('analytics.subtitle')}</p>
        </div>
        <DateRangeFilter value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{t('analytics.revenueOverTime')}</h3>
          <RevenueChart data={data.revenueHistory} />
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{t('analytics.memberGrowth')}</h3>
          <MemberGrowthChart data={data.memberGrowth} />
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{t('analytics.occupancy')}</h3>
          <OccupancyChart data={data.occupancy} />
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{t('analytics.paymentStatus')}</h3>
          <PaymentStatusChart data={data.paymentStatus} />
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{t('analytics.subscriptionPlans')}</h3>
          <SubscriptionsChart data={data.subscriptions} />
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{t('analytics.meetingRoomUsage')}</h3>
          <MeetingRoomChart data={data.meetingRoomUsage} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 md:col-span-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{t('analytics.memberActivity')}</h3>
          <MemberActivityChart data={data.memberActivity} />
        </div>
      </div>

      <InsightsPanel insights={data.insights} />
    </div>
  )
}
