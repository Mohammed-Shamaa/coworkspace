'use client'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { LanguageProvider } from '@/lib/language-provider'
import { AlertCircle } from 'lucide-react'
import '@/lib/i18n'

function RejectedPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t('accountRejected.title')}</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4 text-left">
          <p className="text-sm text-red-700 dark:text-red-300">
            {t('accountRejected.info')}
          </p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg px-6 py-2.5 bg-[#1565C0] text-white font-medium hover:bg-[#1976D2] transition-colors"
        >
          {t('accountRejected.backToHome')}
        </Link>
      </div>
    </div>
  )
}

export default function AccountRejectedPage() {
  return (
    <LanguageProvider>
      <RejectedPage />
    </LanguageProvider>
  )
}
