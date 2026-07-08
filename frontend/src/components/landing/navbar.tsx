'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/lib/theme-provider'
import { Sun, Moon, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 animate-navbar border-b border-white/20 bg-white/70 shadow-sm shadow-black/[0.03] backdrop-blur-xl dark:border-blue-900/20 dark:bg-[#0a0e27]/80 dark:shadow-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 group">
          <Image src="/logo-48.png" alt={t('landing.navbar.logoAlt')} width={32} height={32} className="h-7 w-7 md:h-8 md:w-8 transition-transform group-hover:scale-105" />
          <span className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 hidden sm:inline">{t('landing.navbar.logoAlt')}</span>
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          <button
            onClick={toggleLanguage}
            aria-label={i18n.language === 'ar' ? t('landing.navbar.switchToEnglish') : t('landing.navbar.switchToArabic')}
            className="rounded-lg p-2 md:p-2.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Globe size={16} />
            <span className="ml-1.5 text-xs font-medium hidden sm:inline">
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </span>
          </button>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('landing.navbar.switchToLightMode') : t('landing.navbar.switchToDarkMode')}
            className="rounded-lg p-2 md:p-2.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            href="/about"
            className={`rounded-lg px-2 md:px-4 py-2 text-xs md:text-sm font-medium transition-all ${
              pathname === '/about'
                ? 'text-[#1565C0] dark:text-blue-400'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            {t('landing.navbar.about')}
          </Link>

          <Link
            href="/auth/login"
            className="rounded-lg px-2 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            {t('landing.navbar.signIn')}
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg bg-gradient-to-r from-[#1565C0] to-[#1976D2] px-3 md:px-5 py-2 text-xs md:text-sm font-semibold text-white shadow-sm shadow-blue-200/50 transition-all hover:from-[#0d47a1] hover:to-[#1565C0] hover:shadow-md hover:shadow-blue-300/50 active:scale-[0.97]"
          >
            {t('landing.navbar.signUp')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
