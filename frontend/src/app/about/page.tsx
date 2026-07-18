'use client'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useScrollDirection } from '@/lib/use-scroll-direction'
import { byDirection } from '@/lib/animation-variants'
import { ArrowLeft, Globe, Users, Monitor, HeartHandshake } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

function LinkedInIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function QuoteSection({ dir }: { dir: React.MutableRefObject<'down' | 'up'> }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { t } = useTranslation()

  return (
      <section className="border-t border-gray-100 bg-gray-50/50 py-20 md:py-28 dark:border-[var(--card-border)] dark:bg-[var(--page-bg)]">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          ref={ref}
          variants={byDirection(dir.current)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          whileHover={{
            scale: 1.02,
            textShadow: '0 0 30px rgba(59,130,246,0.5), 0 0 60px rgba(59,130,246,0.2)',
          }}
          className="whitespace-nowrap text-center text-xl font-bold leading-snug text-gray-900 md:text-2xl lg:text-3xl dark:text-[var(--text-primary)] font-['Playfair_Display'] italic"
        >
          {t('about.quote')}
        </motion.div>
      </div>
    </section>
  )
}

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-12 text-center">
      <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0] dark:bg-blue-950">
        {label}
      </span>
      <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-[var(--text-primary)] font-['Playfair_Display']">{title}</h2>
    </div>
  )
}

export default function AboutPage() {
  const { t } = useTranslation()
  const dir = useScrollDirection()
  const textRef = useRef(null)
  const isTextInView = useInView(textRef, { once: false })

  const missions = [
    { icon: Globe, title: t('about.globalAccess'), description: t('about.globalAccessDesc') },
    { icon: Users, title: t('about.empowerTeams'), description: t('about.empowerTeamsDesc') },
    { icon: Monitor, title: t('about.seamlessExperience'), description: t('about.seamlessExperienceDesc') },
    { icon: HeartHandshake, title: t('about.connectPeople'), description: t('about.connectPeopleDesc') },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--page-bg)]">
      {/* Hero */}
      <section className="relative h-[45vh] min-h-[320px] w-full overflow-hidden md:h-[65vh] md:min-h-[420px]">
        <div className="absolute inset-0 z-10 bg-black/10" />
        <Link
          href="/"
          className="absolute left-4 top-4 z-30 inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 md:left-6 md:top-6 md:gap-2 md:px-4 md:text-sm"
        >
          <ArrowLeft size={16} />
          {t('about.backToHome')}
        </Link>
        <Image
          src="/hero-bg-no-text_1.png"
          alt={t('about.heroTitle')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <motion.h1
            ref={textRef}
            variants={byDirection(dir.current)}
            initial="hidden"
            animate={isTextInView ? 'visible' : 'hidden'}
            whileHover={{
              textShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)',
            }}
            className="max-w-4xl text-center text-2xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl font-['Playfair_Display']"
          >
            {t('about.heroTitle')}
          </motion.h1>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-[var(--page-bg)] dark:via-[var(--page-bg)]/60" />
      </section>

      {/* Personal Story */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <FadeIn>
            <SectionHeading label={t('about.storyLabel')} title={t('about.storyTitle')} />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10 dark:border-[var(--card-border)] dark:bg-[var(--card-bg)]">
              <p className="text-lg leading-relaxed text-gray-700 dark:text-[var(--text-primary)]">
                I am a Software Engineer from Gaza, 22 years old, passionate about building scalable digital products
                that solve real-world problems.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-gray-600 dark:text-[var(--text-secondary)]">
                This platform is built with a vision to create a global coworking ecosystem that empowers freelancers,
                teams, and entrepreneurs to collaborate seamlessly from anywhere in the world.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-gray-600 dark:text-[var(--text-secondary)]">
                Despite the challenges, I believe in technology as a bridge between people, and this project represents
                my journey toward that vision.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Mission */}
    <section className="border-t border-gray-100 bg-gray-50/50 py-20 md:py-28 dark:border-[var(--card-border)] dark:bg-[var(--page-bg)]">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <SectionHeading label={t('about.missionLabel')} title={t('about.missionTitle')} />
          </FadeIn>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {missions.map((mission, i) => (
              <FadeIn key={mission.title} delay={0.05 * i}>
                <div className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 dark:border-[var(--card-border)] dark:bg-[var(--card-bg)] dark:hover:border-blue-900">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1565C0] transition-colors group-hover:bg-[#1565C0] group-hover:text-white dark:bg-blue-950 dark:text-blue-400">
                    <mission.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">{mission.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-[var(--text-secondary)]">{mission.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <QuoteSection dir={dir} />

      {/* Contact */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <FadeIn>
            <SectionHeading label={t('about.contactLabel')} title={t('about.contactTitle')} />
          </FadeIn>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <FadeIn delay={0.1}>
              <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-md dark:border-[var(--card-border)] dark:bg-[var(--card-bg)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#0A66C2]/10 text-[#0A66C2]">
                  <LinkedInIcon size={28} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">{t('about.linkedin')}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-[var(--text-secondary)]">{t('about.linkedinDesc')}</p>
                <a
                  href="https://www.linkedin.com/in/mohammed-sham3a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#004182]"
                >
                  <LinkedInIcon size={16} />
                  {t('about.connectLinkedin')}
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-md dark:border-[var(--card-border)] dark:bg-[var(--card-bg)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
                  <WhatsAppIcon size={28} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">{t('about.whatsapp')}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-[var(--text-secondary)]">{t('about.whatsappDesc')}</p>
                <a
                  href="https://wa.me/972597744476"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1da851]"
                >
                  <WhatsAppIcon size={16} />
                  {t('about.chatWhatsapp')}
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
