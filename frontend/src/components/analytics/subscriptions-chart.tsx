'use client'
import { useTheme } from '@/lib/theme-provider'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { AnalyticsSubscriptionPoint } from '@/types'
import '@/lib/i18n'

export default function SubscriptionsChart({ data }: { data: AnalyticsSubscriptionPoint[] }) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#9CA3AF' : '#6B7280'
  const gridColor = isDark ? '#374151' : '#E5E7EB'

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[var(--text-secondary)]">
        {t('analytics.noData')}
      </div>
    )
  }

  const planLabels: Record<string, string> = {
    ThreeDaysPerWeek: t('analytics.plan3Days'),
    SixDaysPerWeek: t('analytics.plan6Days'),
    FullTime: t('analytics.planFullTime'),
    PartTime: t('analytics.planPartTime'),
  }

  const chartData = data.map((d) => ({
    ...d,
    plan: planLabels[d.plan] || d.plan,
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="plan" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: isDark ? '#1F2937' : '#FFF',
              border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <Bar dataKey="count" fill="#7B1FA2" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
