'use client'
import { useTheme } from '@/lib/theme-provider'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { AnalyticsMeetingRoomPoint } from '@/types'
import '@/lib/i18n'

export default function MeetingRoomChart({ data }: { data: AnalyticsMeetingRoomPoint[] }) {
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

  const dayLabels: Record<string, string> = {
    Sunday: t('analytics.sun'),
    Monday: t('analytics.mon'),
    Tuesday: t('analytics.tue'),
    Wednesday: t('analytics.wed'),
    Thursday: t('analytics.thu'),
    Friday: t('analytics.fri'),
    Saturday: t('analytics.sat'),
  }

  const chartData = data.map((d) => ({
    ...d,
    day: dayLabels[d.day] || d.day,
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: isDark ? '#1F2937' : '#FFF',
              border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <Bar dataKey="bookings" fill="#E65100" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
