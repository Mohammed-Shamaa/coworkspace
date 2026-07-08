'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Building2, Users, Calendar, BarChart3, Fingerprint, FileSpreadsheet, Shield, Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

function FeatureCard({ icon: Icon, title, description, index }: { icon: typeof Building2; title: string; description: string; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/30 dark:border-[var(--card-border)] dark:bg-[var(--card-bg)] dark:hover:border-blue-900"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-[#1565C0] shadow-sm transition-all group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#1565C0] group-hover:to-[#1976D2] group-hover:text-white group-hover:shadow-md">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-[var(--text-secondary)]">{description}</p>
    </motion.div>
  )
}

export default function Features() {
  const { t } = useTranslation()
  const features = [
    { icon: Building2, title: t('landing.features.workspaceManagement'), description: t('landing.features.workspaceManagementDesc') },
    { icon: Users, title: t('landing.features.memberManagement'), description: t('landing.features.memberManagementDesc') },
    { icon: Calendar, title: t('landing.features.meetingRoom'), description: t('landing.features.meetingRoomDesc') },
    { icon: BarChart3, title: t('landing.features.analytics'), description: t('landing.features.analyticsDesc') },
    { icon: Fingerprint, title: t('landing.features.attendance'), description: t('landing.features.attendanceDesc') },
    { icon: FileSpreadsheet, title: t('landing.features.excelExport'), description: t('landing.features.excelExportDesc') },
    { icon: Shield, title: t('landing.features.secureAuth'), description: t('landing.features.secureAuthDesc') },
    { icon: Zap, title: t('landing.features.fastPerformance'), description: t('landing.features.fastPerformanceDesc') },
  ]
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="border-t border-gray-100/80 bg-gradient-to-b from-gray-50/80 to-white py-20 md:py-28 dark:border-[var(--card-border)] dark:bg-[var(--page-bg)]" id="features">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0]">{t('landing.features.badge')}</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-[var(--text-primary)]">{t('landing.features.title')}</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-[var(--text-secondary)]">{t('landing.features.subtitle')}</p>
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
