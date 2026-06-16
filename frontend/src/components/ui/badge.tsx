import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'paid' | 'unpaid' | 'default'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    paid: 'bg-[#E8F5E9] text-[#2E7D32] dark:bg-[var(--success-bg)] dark:text-[var(--success-text)]',
    unpaid: 'bg-[#FFF8E1] text-[#E65100] dark:bg-[var(--error-bg)] dark:text-[var(--error-text)]',
    default: 'bg-gray-100 text-gray-700',
  }
  return (
    <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)} {...props} />
  )
}
export { Badge }
