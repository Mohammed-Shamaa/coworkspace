'use client'
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'success' | 'danger' | 'purple' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default:
        'bg-[#1565C0] text-white shadow-sm shadow-blue-200/50 ' +
        'hover:bg-[#0d47a1] hover:shadow-md hover:shadow-blue-300/40 ' +
        'active:scale-[0.97] active:shadow-sm ' +
        'dark:hover:bg-[#1976D2] dark:shadow-blue-950/30',
      success:
        'bg-[#2E7D32] text-white shadow-sm shadow-green-200/50 ' +
        'hover:bg-[#1b5e20] hover:shadow-md hover:shadow-green-300/40 ' +
        'active:scale-[0.97] active:shadow-sm ' +
        'dark:hover:bg-[#388E3C] dark:shadow-green-950/30',
      danger:
        'bg-[#DC2626] text-white shadow-sm shadow-red-200/50 ' +
        'hover:bg-[#b91c1c] hover:shadow-md hover:shadow-red-300/40 ' +
        'active:scale-[0.97] active:shadow-sm ' +
        'dark:hover:bg-[#EF4444] dark:shadow-red-950/30',
      purple:
        'bg-[#7C3AED] text-white shadow-sm shadow-purple-200/50 ' +
        'hover:bg-[#6D28D9] hover:shadow-md hover:shadow-purple-300/40 ' +
        'active:scale-[0.97] active:shadow-sm ' +
        'dark:hover:bg-[#8B5CF6] dark:shadow-purple-950/30',
      ghost:
        'bg-transparent text-[var(--text-primary)] ' +
        'hover:bg-[var(--hover-bg)] hover:backdrop-blur-sm ' +
        'active:scale-[0.97]',
      outline:
        'border border-[var(--card-border)] text-[var(--text-primary)] ' +
        'hover:bg-[var(--hover-bg)] hover:border-[var(--input-focus)]/30 hover:shadow-sm ' +
        'active:scale-[0.97]',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold ' +
          'transition-all duration-200 cursor-pointer ' +
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
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
