'use client'
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const count = useMotionValue(0)
  const displayValue = useTransform(count, (latest) => Math.round(latest))
  const ref = useRef<HTMLSpanElement>(null)
  const prevValue = useRef(value)

  useEffect(() => {
    const start = prevValue.current
    const diff = value - start
    if (diff === 0) {
      count.set(value)
      return
    }
    const controls = animate(count, value, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = Math.round(latest).toLocaleString()
      },
    })
    prevValue.current = value
    return controls.stop
  }, [value, duration])

  return <span ref={ref}>{value.toLocaleString()}</span>
}

export default function KpiCard({
  label,
  value,
  trend,
  icon: Icon,
  colorClasses,
  prefix = '',
  suffix = '',
  isCurrency = false,
}: {
  label: string
  value: number
  trend?: number | null
  icon: LucideIcon
  colorClasses: string
  prefix?: string
  suffix?: string
  isCurrency?: boolean
}) {
  const displayValue = isCurrency
    ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : `${prefix}${value.toLocaleString()}${suffix}`

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 sm:p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] truncate">{label}</p>
          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tabular-nums">
              {isCurrency
                ? <><span className="text-sm">$</span><AnimatedNumber value={Math.round(value * 100) / 100} /></>
                : <AnimatedNumber value={value} />
              }
              {suffix && <span className="text-sm ml-0.5">{suffix}</span>}
            </span>
            {trend !== null && trend !== undefined && trend !== 0 && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  trend > 0
                    ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30'
                    : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
                }`}
              >
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className={`shrink-0 p-2.5 rounded-lg ${colorClasses}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  )
}
