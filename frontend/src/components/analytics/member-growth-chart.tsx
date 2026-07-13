'use client'
import { useTheme } from '@/lib/theme-provider'
import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { AnalyticsMemberGrowthPoint } from '@/types'
import '@/lib/i18n'

export default function MemberGrowthChart({ data }: { data: AnalyticsMemberGrowthPoint[] }) {
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
        <AreaChart data={data}>
          <defs>
            <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="newMembers"
            stroke="#2E7D32"
            strokeWidth={2}
            fill="url(#memberGradient)"
            dot={{ fill: '#2E7D32', r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
