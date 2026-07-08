import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] ' +
          'placeholder:text-[var(--text-muted)] ' +
          'shadow-sm shadow-black/[0.02] ' +
          'transition-all duration-200 ' +
          'focus:outline-none focus:ring-2 focus:ring-[var(--input-focus)]/20 focus:border-[var(--input-focus)] focus:shadow-md focus:shadow-[var(--input-focus)]/10 ' +
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
export { Input }
