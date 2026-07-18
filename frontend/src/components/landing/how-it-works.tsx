'use client'
import { UserPlus, Users, CalendarCheck, LayoutDashboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import ScrollReveal from './scroll-reveal'

function StepCard({ icon: Icon, title, description, index, totalSteps }: { icon: typeof UserPlus; title: string; description: string; index: number; totalSteps: number }) {
  return (
    <ScrollReveal
      delay={index * 0.15}
      yOffset={0}
      duration={0.5}
      className="relative flex gap-6"
    >
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1565C0] text-white shadow-md">
          <Icon size={22} />
        </div>
        {index < totalSteps - 1 && (
          <div className="mt-2 w-0.5 flex-1 bg-gradient-to-b from-blue-200 to-transparent dark:from-blue-800" />
        )}
      </div>
      <div className="pb-12 pt-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)] font-['Playfair_Display']">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:[var(--text-secondary)]">{description}</p>
      </div>
    </ScrollReveal>
  )
}

export default function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    { icon: UserPlus, title: t('landing.howItWorks.step1Title'), description: t('landing.howItWorks.step1Desc') },
    { icon: Users, title: t('landing.howItWorks.step2Title'), description: t('landing.howItWorks.step2Desc') },
    { icon: CalendarCheck, title: t('landing.howItWorks.step3Title'), description: t('landing.howItWorks.step3Desc') },
    { icon: LayoutDashboard, title: t('landing.howItWorks.step4Title'), description: t('landing.howItWorks.step4Desc') },
  ]

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal yOffset={20} className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0]">{t('landing.howItWorks.badge')}</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-[var(--text-primary)] font-['Playfair_Display']">{t('landing.howItWorks.title')}</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-[var(--text-secondary)]">{t('landing.howItWorks.subtitle')}</p>
        </ScrollReveal>

        <div className="mx-auto mt-16 max-w-2xl">
          {steps.map((step, i) => (
            <StepCard key={step.title} {...step} index={i} totalSteps={steps.length} />
          ))}
        </div>
      </div>
    </section>
  )
}
