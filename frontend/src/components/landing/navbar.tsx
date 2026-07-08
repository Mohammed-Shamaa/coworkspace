'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/lib/theme-provider'
import { Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  const isRTL = i18n.language === 'ar'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 animate-navbar border-b border-white/20 dark:border-blue-900/20 glass dark:bg-[#0a0e27]/80 dark:shadow-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 group">
          <Image src="/logo-48.png" alt={t('landing.navbar.logoAlt')} width={32} height={32} className="h-7 w-7 md:h-8 md:w-8 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 hidden sm:inline">Deskora</span>
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ar')}
            aria-label={isRTL ? t('landing.navbar.switchToEnglish') : t('landing.navbar.switchToArabic')}
            className="rounded-lg p-2 md:p-2.5 text-gray-500 transition-all duration-200 hover:bg-white/70 hover:scale-105 active:scale-95 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <span className="text-xs md:text-sm font-medium">{isRTL ? 'EN' : 'العربية'}</span>
          </button>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('landing.navbar.switchToLightMode') : t('landing.navbar.switchToDarkMode')}
            className="rounded-lg p-2 md:p-2.5 text-gray-500 transition-all duration-200 hover:bg-white/70 hover:scale-105 active:scale-95 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <Sun size={16} className="transition-transform duration-200 hover:rotate-45" /> : <Moon size={16} className="transition-transform duration-200 hover:-rotate-12" />}
          </button>

          <Link
            href="/about"
            className={`rounded-lg px-2 md:px-4 py-2 text-xs md:text-sm font-medium transition-all duration-200 ${
              pathname === '/about'
                ? 'text-[#1565C0] dark:text-blue-400'
                : 'text-gray-600 hover:bg-white/70 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            {t('landing.navbar.about')}
          </Link>

          <Link
            href="/auth/login"
            className="rounded-lg px-2 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            {t('landing.navbar.signIn')}
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg bg-[#1565C0] px-3 md:px-5 py-2 text-xs md:text-sm font-semibold text-white shadow-sm shadow-blue-200/50 transition-all duration-200 hover:bg-[#0d47a1] hover:shadow-md hover:shadow-blue-300/40 active:scale-95"
          >
            {t('landing.navbar.signUp')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
