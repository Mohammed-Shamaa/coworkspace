'use client'
import { useTheme } from '@/lib/theme-provider'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { AnalyticsPaymentStatusData } from '@/types'
import '@/lib/i18n'

const COLORS = ['#2E7D32', '#E65100']

export default function PaymentStatusChart({ data }: { data: AnalyticsPaymentStatusData | null }) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const isDark = theme === 'dark'

  if (!data || (data.paid === 0 && data.unpaid === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[var(--text-secondary)]">
        {t('analytics.noData')}
      </div>
    )
  }

  const chartData = [
    { name: t('analytics.paid'), value: data.paid },
    { name: t('analytics.unpaid'), value: data.unpaid },
  ]

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
