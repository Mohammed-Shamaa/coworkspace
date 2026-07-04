'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { MutableRefObject } from 'react'
import { byDirection, fadeLeft, fadeRight } from '@/lib/animation-variants'
import { UserPlus, Users, CalendarCheck, LayoutDashboard } from 'lucide-react'

const steps = [
  { icon: UserPlus, title: 'Create your workspace', description: 'Set up your coworking space in minutes — configure desks, hours, and meeting rooms.' },
  { icon: Users, title: 'Add your members', description: 'Register members with their plans, fees, and start dates. Manage renewals effortlessly.' },
  { icon: CalendarCheck, title: 'Manage reservations', description: 'Members can book desks and meeting rooms. Track usage and availability in real time.' },
  { icon: LayoutDashboard, title: 'Track everything easily', description: 'Monitor revenue, attendance, and growth from a beautiful analytics dashboard.' },
]

function StepCard({ icon: Icon, title, description, index }: { icon: typeof steps[0]['icon']; title: string; description: string; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      variants={index % 2 === 0 ? fadeLeft : fadeRight}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.5, delay: index * 0.15 }}
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
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </motion.div>
  )
}

export default function HowItWorks({ dir }: { dir: MutableRefObject<'down' | 'up'> }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-100px' })

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          variants={byDirection(dir.current)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0] dark:bg-blue-950">How It Works</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">Get started in four simple steps</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">From setup to full operation — fast and frictionless.</p>
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
