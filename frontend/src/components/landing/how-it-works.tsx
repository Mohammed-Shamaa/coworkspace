'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { UserPlus, Users, CalendarCheck, LayoutDashboard } from 'lucide-react'

const steps = [
  { icon: UserPlus, title: 'Create your workspace', description: 'Set up your coworking space in minutes — configure desks, hours, and meeting rooms.' },
  { icon: Users, title: 'Add your members', description: 'Register members with their plans, fees, and start dates. Manage renewals effortlessly.' },
  { icon: CalendarCheck, title: 'Manage reservations', description: 'Members can book desks and meeting rooms. Track usage and availability in real time.' },
  { icon: LayoutDashboard, title: 'Track everything easily', description: 'Monitor revenue, attendance, and growth from a beautiful analytics dashboard.' },
]

function StepCard({ icon: Icon, title, description, index }: { icon: typeof steps[0]['icon']; title: string; description: string; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
      className="relative flex gap-6"
    >
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1565C0] text-white shadow-md">
          <Icon size={22} />
        </div>
        {index < steps.length - 1 && (
          <div className="mt-2 w-0.5 flex-1 bg-gradient-to-b from-blue-200 to-transparent dark:from-blue-800" />
        )}
      </div>
      <div className="pb-12 pt-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-[var(--text-secondary)]">{description}</p>
      </div>
    </motion.div>
  )
}

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0]">How It Works</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-[var(--text-primary)]">Get started in four simple steps</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-[var(--text-secondary)]">From setup to full operation — fast and frictionless.</p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-2xl">
          {steps.map((step, i) => (
            <StepCard key={step.title} {...step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
