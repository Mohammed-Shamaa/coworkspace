import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'paid' | 'unpaid' | 'trial' | 'expired' | 'default'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    paid: 'bg-[var(--badge-paid-bg)] text-[var(--badge-paid-text)] border border-green-200/50 dark:border-green-900/30',
    unpaid: 'bg-[var(--badge-unpaid-bg)] text-[var(--badge-unpaid-text)] border border-orange-200/50 dark:border-orange-900/30',
    trial: 'bg-[var(--badge-trial-bg)] text-[var(--badge-trial-text)] border border-blue-200/50 dark:border-blue-900/30',
    expired: 'bg-[var(--badge-expired-bg)] text-[var(--badge-expired-text)] border border-red-200/50 dark:border-red-900/30',
    default: 'bg-[var(--badge-default-bg)] text-[var(--badge-default-text)] border border-gray-200/50 dark:border-gray-700/30',
  }
  return (
    <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm', variants[variant], className)} {...props} />
  )
}
export { Badge }
