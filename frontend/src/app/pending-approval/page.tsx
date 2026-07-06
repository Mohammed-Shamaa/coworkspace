'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Clock, AlertCircle } from 'lucide-react'

export default function PendingApprovalPage() {
  const { tenant, logout } = useAuth()
  const router = useRouter()

  if (tenant?.status === 'Approved') {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)] p-4">
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/5 p-8 w-full max-w-md mx-4 text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Account Pending Approval</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          Your workspace <strong>{tenant?.companyName}</strong> has been created and is currently under review.
          A Super Admin will review your workspace details and activate your account soon.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-4 mb-6 text-left text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <span>You'll get full access once your account is approved and your 30-day free trial begins. Check back later.</span>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)]">
            Need help? Contact us at <a href="mailto:support@deskora.com" className="text-[#1565C0] hover:underline">support@deskora.com</a>
          </p>
          <button
            onClick={() => { logout(); router.push('/') }}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
