'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

export default function Hero() {
  const { t } = useTranslation()
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/home_pic.png"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/60" />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-20 md:py-32 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-block rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-semibold text-white">
            {t('landing.hero.badge')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          {t('landing.hero.title1')}{' '}
          <span className="text-blue-300">{t('landing.hero.title2')}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl"
        >
          {t('landing.hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/auth/register"
            className="rounded-xl bg-[#1565C0] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:bg-[#0d47a1] hover:shadow-blue-800/40"
          >
            {t('landing.hero.getStarted')}
          </Link>
          <Link
            href="/auth/login"
            className="rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            {t('landing.hero.signIn')}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
