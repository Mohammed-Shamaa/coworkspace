import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return `$${amount.toFixed(2)}`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function formatTime(time: string): string {
  if (!time) return '-'
  return time.substring(0, 5)
}

export interface ApiError {
  status: number
  message: string
  code?: string
  errors?: Record<string, string[]>
}

export function handleApiError(error: unknown): ApiError {
  const axiosErr = error as {
    code?: string
    response?: { status?: number; data?: { message?: string; code?: string; errors?: Record<string, string[]> } }
    message?: string
  }

  if (axiosErr?.code === 'ERR_NETWORK' || !axiosErr?.response) {
    return { status: 0, message: 'Server is not reachable. Please check your connection and try again.', code: 'NETWORK_ERROR' }
  }

  const status = axiosErr.response.status ?? 0

  if (status >= 500) {
    return { status, message: 'Internal server error. Please try again later.', code: 'INTERNAL_SERVER_ERROR' }
  }

  const data = axiosErr.response.data
  return {
    status,
    message: data?.message ?? 'An unexpected error occurred.',
    code: data?.code,
    errors: data?.errors
  }
}
