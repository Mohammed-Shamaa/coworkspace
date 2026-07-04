'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { MutableRefObject } from 'react'
import { byDirection, scaleIn } from '@/lib/animation-variants'
import {
  Building2, Users, Calendar, BarChart3, Fingerprint, FileSpreadsheet, Shield, Zap,
} from 'lucide-react'

const features = [
  { icon: Building2, title: 'Workspace Management', description: 'Configure desks, capacity, and workspace settings tailored to your space.' },
  { icon: Users, title: 'Member Management', description: 'Track members, renewals, payments, and profiles from a single dashboard.' },
  { icon: Calendar, title: 'Meeting Room Reservations', description: 'Let members book meeting rooms with an easy scheduling system.' },
  { icon: BarChart3, title: 'Analytics Dashboard', description: 'Visualize revenue, occupancy trends, and member growth in real time.' },
  { icon: Fingerprint, title: 'Attendance Tracking', description: 'Monitor check-ins and daily attendance with simple tracking tools.' },
  { icon: FileSpreadsheet, title: 'Excel Export', description: 'Export member lists, payments, and reports to Excel with one click.' },
  { icon: Shield, title: 'Secure Authentication', description: 'Multi-tenant architecture with JWT-based auth and role management.' },
  { icon: Zap, title: 'Fast Performance', description: 'Optimized queries and lazy-loaded components keep the app blazing fast.' },
]

function FeatureCard({ icon: Icon, title, description, index }: { icon: typeof features[0]['icon']; title: string; description: string; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      variants={scaleIn}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group rounded-2xl border border-gray-100 bg-blue-50 p-6 transition-all hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900 dark:hover:shadow-blue-950"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1565C0] transition-colors group-hover:bg-[#1565C0] group-hover:text-white dark:bg-blue-950 dark:text-blue-400 dark:group-hover:bg-[#1565C0] dark:group-hover:text-white">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
    </motion.div>
  )
}

export default function Features({ dir }: { dir: MutableRefObject<'down' | 'up'> }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="border-t border-gray-100 bg-gray-50/50 py-20 md:py-28 dark:border-gray-800 dark:bg-gray-950/50" id="features">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          variants={byDirection(dir.current)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0] dark:bg-blue-950">Features</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">Everything you need to run your space</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Powerful tools designed for modern coworking spaces.</p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
