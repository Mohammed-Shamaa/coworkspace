'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { t } = useTranslation()

  return (
    <section className="border-t border-gray-100 py-20 md:py-28 dark:border-[var(--card-border)]">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-[#0d1b3e] px-8 py-16 text-center md:px-16 md:py-20"
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#1565C0]/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white md:text-4xl">{t('landing.cta.title')}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-200/90">
              {t('landing.cta.subtitle')}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-[#0d1b3e] shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl active:scale-[0.97]"
              >
                {t('landing.cta.getStarted')}
              </Link>
              <Link
                href="/auth/login"
                className="rounded-xl border border-blue-400/30 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-white/10 hover:shadow-md active:scale-[0.97]"
              >
                {t('landing.cta.signIn')}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
