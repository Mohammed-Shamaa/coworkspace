'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

export default function Hero() {
  const { t } = useTranslation()
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-40 md:pb-28">
      {/* Premium background with gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-purple-50/60 dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-900" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/30 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #1565C0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="inline-block rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-1.5 text-xs font-semibold text-[#1565C0] shadow-sm dark:from-blue-950 dark:to-blue-900">
                {t('landing.hero.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-[var(--text-primary)]"
            >
              {t('landing.hero.title1')}{' '}
              <span className="bg-gradient-to-r from-[#1565C0] to-[#0EA5E9] bg-clip-text text-transparent">{t('landing.hero.title2')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="mt-6 text-lg leading-relaxed text-gray-500 md:text-xl dark:text-[var(--text-secondary)]"
            >
              {t('landing.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/auth/register"
                className="rounded-xl bg-gradient-to-r from-[#1565C0] to-[#0EA5E9] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200/60 transition-all duration-200 hover:shadow-xl hover:shadow-blue-300/50 active:scale-[0.97] hover:brightness-110"
              >
                {t('landing.hero.getStarted')}
              </Link>
              <Link
                href="/auth/login"
                className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-white hover:shadow-md dark:border-[var(--card-border)] dark:bg-[var(--card-bg)]/80 dark:text-[var(--text-primary)] dark:hover:border-blue-900"
              >
                {t('landing.hero.signIn')}
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="relative hidden md:block"
          >
            <div className="relative">
              <div className="rounded-2xl border border-white/50 bg-white/90 p-2 shadow-2xl shadow-blue-200/30 backdrop-blur-xl dark:border-[var(--card-border)] dark:bg-[var(--card-bg)]/90 dark:shadow-gray-950/50">
                <div className="rounded-xl bg-gradient-to-br from-[#1565C0]/5 via-blue-50/50 to-purple-50/30 p-6 dark:from-[#1565C0]/10 dark:via-blue-950/20 dark:to-purple-950/20">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400 shadow-sm" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-sm" />
                    <div className="h-3 w-3 rounded-full bg-green-400 shadow-sm" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 rounded-full bg-gradient-to-r from-gray-200 to-gray-100" />
                    <div className="h-4 w-1/2 rounded-full bg-gradient-to-r from-gray-200 to-gray-100" />
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/60 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
                          <div className={`mb-2 h-8 w-8 rounded-lg ${['bg-blue-100', 'bg-green-100', 'bg-yellow-100'][i]}`} />
                          <div className="h-3 w-full rounded-full bg-gradient-to-r from-gray-100 to-gray-50" />
                          <div className="mt-1 h-5 w-10 rounded bg-gradient-to-r from-gray-200 to-gray-100" />
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-white/60 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-24 rounded-full bg-gradient-to-r from-gray-100 to-gray-50" />
                        <div className="h-3 w-16 rounded-full bg-gradient-to-r from-gray-100 to-gray-50" />
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-gray-100 to-gray-50" />
                        <div className="h-2.5 w-5/6 rounded-full bg-gradient-to-r from-gray-100 to-gray-50" />
                        <div className="h-2.5 w-4/6 rounded-full bg-gradient-to-r from-gray-100 to-gray-50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative floating elements */}
              <div className="absolute -bottom-6 -right-6 -z-10 h-80 w-80 rounded-full bg-gradient-to-br from-blue-200/40 to-purple-200/30 blur-3xl animate-float-slow" />
              <div className="absolute -top-6 -left-6 -z-10 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-200/30 to-blue-200/20 blur-3xl animate-float-medium" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
