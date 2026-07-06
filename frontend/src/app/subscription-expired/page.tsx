'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { CreditCard, AlertCircle } from 'lucide-react'

export default function SubscriptionExpiredPage() {
  const { tenant, logout } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  if (tenant?.paymentStatus === 'Active' || tenant?.paymentStatus === 'Trial') {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)] p-4">
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/5 p-8 w-full max-w-md mx-4 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t('subscriptionExpired.title')}</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          {t('subscriptionExpired.description')} <strong>{tenant?.companyName}</strong> {t('subscriptionExpired.description2')}
        </p>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4 mb-6 text-left text-sm text-red-800 dark:text-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{t('subscriptionExpired.info')}</span>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)]">
            {t('subscriptionExpired.contact')} <a href="mailto:support@deskora.com" className="text-[#1565C0] hover:underline">support@deskora.com</a> {t('subscriptionExpired.contact2')}
          </p>
          <button
            onClick={() => { logout(); router.push('/') }}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline"
          >
            {t('subscriptionExpired.backToHome')}
          </button>
        </div>
      </div>
    </div>
  )
}
