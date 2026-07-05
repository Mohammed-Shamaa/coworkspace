'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

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
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="border-t border-gray-100 bg-gray-50/50 py-20 md:py-28 dark:border-[var(--card-border)] dark:bg-[var(--page-bg)]">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0]">Dashboard</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-[var(--text-primary)]">Beautiful analytics at your fingertips</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-[var(--text-secondary)]">Real-time insights into your workspace performance.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14"
        >
          <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl shadow-gray-200/50 dark:border-[var(--card-border)] dark:bg-[var(--card-bg)] dark:shadow-gray-950/50">
            <div className="rounded-xl bg-white p-6 dark:bg-[var(--card-bg)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">Revenue Overview</h3>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Weekly revenue breakdown</p>
                </div>
                  <div className="flex gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                    <div className="h-3 w-3 rounded bg-[#1565C0]" />
                    Revenue
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                    <div className="h-3 w-3 rounded bg-blue-200 dark:bg-blue-800" />
                    Target
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
                  <p className="text-xs font-medium text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">$10,100</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-[var(--text-secondary)]">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">128</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-[var(--text-secondary)]">Occupancy</p>
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
