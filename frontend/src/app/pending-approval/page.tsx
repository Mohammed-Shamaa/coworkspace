import AuthBackground from '@/components/auth-background'
import Link from 'next/link'
import { Clock, Mail } from 'lucide-react'

export default function PendingApprovalPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--page-bg)]">
      <AuthBackground />
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/5 p-8 w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
          <Clock size={32} className="text-amber-600 dark:text-amber-300" />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Application Under Review</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Your company registration has been submitted successfully and is currently pending review by our team.
          You will be notified once your application is approved.
        </p>
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <Mail size={16} className="text-[#1565C0] mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--text-secondary)]">
              For any inquiries, please contact our support team at <strong className="text-[var(--text-primary)]">support@deskora.com</strong>
            </p>
          </div>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-lg bg-[#1565C0] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1976D2] transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
