'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

const data = [
  { name: 'Mon', revenue: 1200 },
  { name: 'Tue', revenue: 1800 },
  { name: 'Wed', revenue: 1400 },
  { name: 'Thu', revenue: 2100 },
  { name: 'Fri', revenue: 1600 },
  { name: 'Sat', revenue: 900 },
  { name: 'Sun', revenue: 1100 },
]

const gradientOffset = () => {
  const dataMax = Math.max(...data.map(d => d.revenue))
  const dataMin = Math.min(...data.map(d => d.revenue))
  if (dataMax <= 0) return 0
  if (dataMin >= 0) return 1
  return dataMax / (dataMax - dataMin)
}

export default function DashboardPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden border-t border-gray-100 py-20 md:py-28 dark:border-[var(--card-border)]">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50/50 dark:from-transparent dark:to-gray-950/50" />
      <div className="mx-auto max-w-7xl px-6 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-1.5 text-xs font-semibold text-[#1565C0] shadow-sm dark:from-blue-950 dark:to-blue-900">{t('landing.dashboard.badge')}</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-[var(--text-primary)]">{t('landing.dashboard.title')}</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-[var(--text-secondary)]">{t('landing.dashboard.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14"
        >
          <div className="rounded-2xl border border-white/50 bg-white/90 p-2 shadow-2xl shadow-blue-200/30 backdrop-blur-xl dark:border-[var(--card-border)] dark:bg-[var(--card-bg)]/90 dark:shadow-gray-950/50">
            <div className="rounded-xl bg-white p-6 dark:bg-[var(--card-bg)]">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">{t('landing.dashboard.revenueOverview')}</h3>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">{t('landing.dashboard.weeklyRevenue')}</p>
                </div>
                  <div className="flex gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                    <div className="h-3 w-3 rounded bg-gradient-to-b from-[#1565C0] to-[#0EA5E9]" />
                    {t('landing.dashboard.revenue')}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                    <div className="h-3 w-3 rounded bg-blue-200 dark:bg-blue-800" />
                    {t('landing.dashboard.target')}
                  </div>
                </div>
              </div>

              <div className="h-64" ref={ref}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1565C0" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
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
        </motion.div>
      </div>
    </section>
  )
}
