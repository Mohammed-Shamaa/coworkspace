import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { DeskoraLogo } from '@/components/deskora-logo'
import '@/lib/i18n'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-gray-100 bg-white py-12 dark:border-[var(--card-border)] dark:bg-[var(--card-bg)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <img src="/logo-48.png" alt="DesKora" className="h-8 w-8" />
            <DeskoraLogo className="text-lg text-gray-900 dark:text-[var(--text-primary)]" />
          </div>

          <nav className="flex items-center gap-4 md:gap-6 text-sm">
            <Link href="/" className="text-gray-500 transition-colors hover:text-gray-900 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]">{t('landing.footer.home')}</Link>
            <Link href="/auth/login" className="text-gray-500 transition-colors hover:text-gray-900 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]">{t('landing.footer.login')}</Link>
            <Link href="/auth/register" className="text-gray-500 transition-colors hover:text-gray-900 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]">{t('landing.footer.register')}</Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8 text-center text-sm text-gray-400 dark:border-[var(--card-border)]">
          {t('landing.footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  )
}
