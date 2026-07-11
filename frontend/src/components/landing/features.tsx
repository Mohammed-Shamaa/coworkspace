'use client'
import {
  Building2, Users, Calendar, BarChart3, Fingerprint, FileSpreadsheet, Shield, Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import ScrollReveal from './scroll-reveal'

function FeatureCard({ icon: Icon, title, description, index }: { icon: typeof Building2; title: string; description: string; index: number }) {
  return (
    <ScrollReveal
      delay={index * 0.08}
      yOffset={30}
      duration={0.5}
      className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 dark:border-[var(--card-border)] dark:bg-[var(--card-bg)] dark:hover:border-blue-900"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1565C0] transition-colors group-hover:bg-[#1565C0] group-hover:text-white">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-[var(--text-secondary)]">{description}</p>
    </ScrollReveal>
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

  return (
    <section className="border-t border-gray-100 bg-gray-50/50 py-20 md:py-28 dark:border-[var(--card-border)] dark:bg-[var(--page-bg)]" id="features">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal yOffset={20} className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0]">{t('landing.features.badge')}</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-[var(--text-primary)]">{t('landing.features.title')}</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-[var(--text-secondary)]">{t('landing.features.subtitle')}</p>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
