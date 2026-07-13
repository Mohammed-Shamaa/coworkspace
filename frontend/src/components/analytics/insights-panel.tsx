'use client'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp, AlertTriangle, Clock, Info, Layout, Users, Calendar,
} from 'lucide-react'
import type { AnalyticsInsight } from '@/types'
import '@/lib/i18n'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'trending-up': TrendingUp,
  'alert-triangle': AlertTriangle,
  'clock': Clock,
  'info': Info,
  'layout': Layout,
  'users': Users,
  'calendar': Calendar,
}

const typeStyles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-400',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/10',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
  },
}

export default function InsightsPanel({ insights }: { insights: AnalyticsInsight[] }) {
  const { t } = useTranslation()

  if (insights.length === 0) return null

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5">
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t('analytics.insights')}</h3>
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = iconMap[insight.icon] || Info
          const style = typeStyles[insight.type] || typeStyles.info
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${style.bg} ${style.border}`}
            >
              <div className={`shrink-0 mt-0.5 ${style.icon}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${style.text}`}>{insight.title}</p>
                <p className={`text-xs mt-0.5 ${style.text} opacity-80`}>{insight.message}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
