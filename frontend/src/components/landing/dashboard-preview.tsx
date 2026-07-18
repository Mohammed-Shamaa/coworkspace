'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import ScrollReveal from './scroll-reveal'

const data = [
  { name: 'Mon', revenue: 1200 },
  { name: 'Tue', revenue: 1800 },
  { name: 'Wed', revenue: 1400 },
  { name: 'Thu', revenue: 2100 },
  { name: 'Fri', revenue: 1600 },
  { name: 'Sat', revenue: 900 },
  { name: 'Sun', revenue: 1100 },
]

export default function DashboardPreview() {
  const { t } = useTranslation()

  return (
    <section className="border-t border-gray-100 bg-gray-50/50 py-20 md:py-28 dark:border-[var(--card-border)] dark:bg-[var(--page-bg)]">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal yOffset={20} className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0]">{t('landing.dashboard.badge')}</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-[var(--text-primary)] font-['Playfair_Display']">{t('landing.dashboard.title')}</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-[var(--text-secondary)]">{t('landing.dashboard.subtitle')}</p>
        </ScrollReveal>

        <ScrollReveal
          yOffset={40}
          delay={0.2}
          duration={0.6}
          className="mt-14"
        >
          <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl shadow-gray-200/50 dark:border-[var(--card-border)] dark:bg-[var(--card-bg)] dark:shadow-gray-950/50">
            <div className="rounded-xl bg-white p-6 dark:bg-[var(--card-bg)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">{t('landing.dashboard.revenueOverview')}</h3>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">{t('landing.dashboard.weeklyRevenue')}</p>
                </div>
                  <div className="flex gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                    <div className="h-3 w-3 rounded bg-[#1565C0]" />
                    {t('landing.dashboard.revenue')}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                    <div className="h-3 w-3 rounded bg-blue-200 dark:bg-blue-800" />
                    {t('landing.dashboard.target')}
                  </div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Bar dataKey="revenue" fill="#1565C0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-6 dark:border-[var(--card-border)]">
                <div>
                  <p className="text-xs font-medium text-gray-400">{t('landing.dashboard.totalRevenue')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">$10,100</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-[var(--text-secondary)]">{t('landing.dashboard.activeMembers')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">128</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-[var(--text-secondary)]">{t('landing.dashboard.occupancy')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">84%</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
