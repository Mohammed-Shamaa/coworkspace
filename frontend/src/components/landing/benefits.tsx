'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Clock, CreditCard, HeadphonesIcon, RefreshCw, Globe, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

function BenefitCard({ icon: Icon, title, description, index }: { icon: React.ElementType; title: string; description: string; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      className="group flex gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50/50 dark:border-[var(--card-border)] dark:bg-[var(--card-bg)] dark:hover:border-blue-900"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-[#1565C0] shadow-sm transition-all group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#1565C0] group-hover:to-[#1976D2] group-hover:text-white group-hover:shadow-md">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-[var(--text-secondary)]">{description}</p>
      </div>
    </motion.div>
  )
}

export default function Benefits() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { t } = useTranslation()

  const benefits = [
    { icon: Clock, title: t('landing.benefits.saveTime'), description: t('landing.benefits.saveTimeDesc') },
    { icon: CreditCard, title: t('landing.benefits.smartPayments'), description: t('landing.benefits.smartPaymentsDesc') },
    { icon: HeadphonesIcon, title: t('landing.benefits.dedicatedSupport'), description: t('landing.benefits.dedicatedSupportDesc') },
    { icon: RefreshCw, title: t('landing.benefits.autoRenewals'), description: t('landing.benefits.autoRenewalsDesc') },
    { icon: Globe, title: t('landing.benefits.multiLanguage'), description: t('landing.benefits.multiLanguageDesc') },
    { icon: Smartphone, title: t('landing.benefits.mobileFriendly'), description: t('landing.benefits.mobileFriendlyDesc') },
  ]

  return (
    <section className="py-20 md:py-28" id="benefits">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0]">{t('landing.benefits.badge')}</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-[var(--text-primary)]">{t('landing.benefits.title')}</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-[var(--text-secondary)]">{t('landing.benefits.subtitle')}</p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => (
            <BenefitCard key={benefit.title} {...benefit} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
