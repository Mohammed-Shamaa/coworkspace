'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { MutableRefObject } from 'react'
import { byDirection, gentleScale } from '@/lib/animation-variants'
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

export default function DashboardPreview({ dir }: { dir: MutableRefObject<'down' | 'up'> }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-100px' })

  return (
    <section className="border-t border-gray-100 bg-gray-50/50 py-20 md:py-28 dark:border-gray-800 dark:bg-gray-950/50">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          variants={byDirection(dir.current)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0] dark:bg-blue-950">Dashboard</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">Beautiful analytics at your fingertips</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Real-time insights into your workspace performance.</p>
        </motion.div>

        <motion.div
          variants={gentleScale}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14"
        >
          <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-gray-950/50">
            <div className="rounded-xl bg-white p-6 dark:bg-gray-900">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Revenue Overview</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Weekly revenue breakdown</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <div className="h-3 w-3 rounded bg-[#1565C0]" />
                    Revenue
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
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

              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6 dark:border-gray-800">
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$10,100</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">128</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Occupancy</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">84%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
