'use client'
import { useTheme } from '@/lib/theme-provider'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { AnalyticsMemberActivityPoint } from '@/types'
import '@/lib/i18n'

export default function MemberActivityChart({ data }: { data: AnalyticsMemberActivityPoint[] }) {
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

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: isDark ? '#1F2937' : '#FFF',
              border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' }}
          />
          <Bar dataKey="newMembers" name={t('analytics.newMembers')} fill="#1565C0" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expiredMembers" name={t('analytics.expiredMembers')} fill="#C62828" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
