'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Clock, CreditCard, HeadphonesIcon, RefreshCw, Globe, Smartphone } from 'lucide-react'

const benefits = [
  { icon: Clock, title: 'Save Time', description: 'Automate renewals, reminders, and reporting so you can focus on growing your space.' },
  { icon: CreditCard, title: 'Smart Payments', description: 'Track payments, dues, and financials with a clear overview of who has paid.' },
  { icon: HeadphonesIcon, title: 'Dedicated Support', description: 'Our team is here to help you every step of the way with fast response times.' },
  { icon: RefreshCw, title: 'Auto Renewals', description: 'Membership renewals are handled automatically — no manual follow-ups needed.' },
  { icon: Globe, title: 'Multi-language', description: 'Full Arabic and English support with RTL layout for regional coworking spaces.' },
  { icon: Smartphone, title: 'Mobile Friendly', description: 'Access your dashboard and manage members from any device, anywhere.' },
]

function BenefitCard({ icon: Icon, title, description, index }: { icon: typeof benefits[0]['icon']; title: string; description: string; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-blue-100 hover:shadow-md dark:border-[var(--card-border)] dark:bg-[var(--card-bg)] dark:hover:border-blue-900"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1565C0]">
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
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0]">Benefits</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-[var(--text-primary)]">Why coworking spaces choose us</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-[var(--text-secondary)]">Built for real workspaces. Trusted by growing teams.</p>
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
