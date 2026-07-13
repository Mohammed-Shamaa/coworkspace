'use client'
import { useTranslation } from 'react-i18next'
import type { AnalyticsPeriod } from '@/types'
import '@/lib/i18n'

const periods: { value: AnalyticsPeriod; labelKey: string }[] = [
  { value: '7d', labelKey: 'analytics.period7d' },
  { value: '30d', labelKey: 'analytics.period30d' },
  { value: '90d', labelKey: 'analytics.period90d' },
  { value: '1y', labelKey: 'analytics.period1y' },
]

export default function DateRangeFilter({
  value,
  onChange,
}: {
  value: AnalyticsPeriod
  onChange: (p: AnalyticsPeriod) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-1.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-1">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            value === p.value
              ? 'bg-[#1565C0] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'
          }`}
        >
          {t(p.labelKey)}
        </button>
      ))}
    </div>
  )
}
