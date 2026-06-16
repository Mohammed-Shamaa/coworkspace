import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'success' | 'danger' | 'purple' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-[#1565C0] text-white hover:bg-[#0d47a1] dark:hover:bg-[#1976D2]',
      success: 'bg-[#2E7D32] text-white hover:bg-[#1b5e20] dark:hover:bg-[#388E3C]',
      danger: 'bg-[#C62828] text-white hover:bg-[#b71c1c] dark:hover:bg-[#D32F2F]',
      purple: 'bg-[#6A1B9A] text-white hover:bg-[#4a148c] dark:hover:bg-[#7B1FA2]',
      ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[#2a2a3e]',
      outline: 'border border-[var(--card-border)] text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[#2a2a3e]',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
