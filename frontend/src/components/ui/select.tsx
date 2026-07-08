'use client'
import * as React from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    const { t } = useTranslation()
    return (
      <select
        className={cn(
          'flex h-10 w-full rounded border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent',
          className
        )}
        ref={ref}
        {...props}
      >
        <option value="">{t('common.selectPlaceholder')}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )
  }
)
Select.displayName = "Select"
export { Select }
