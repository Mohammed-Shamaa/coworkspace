'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/lib/theme-provider'
import { Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 animate-navbar border-b border-blue-100/30 bg-blue-50/60 shadow-sm shadow-blue-500/5 backdrop-blur-xl dark:border-blue-900/20 dark:bg-gray-950/70 dark:shadow-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-48.png" alt="Deskora" width={32} height={32} className="h-8 w-8" />
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Deskora</span>
        </Link>
        <nav className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg p-2.5 text-gray-500 transition-colors hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            href="/about"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              pathname === '/about'
                ? 'text-[#1565C0] dark:text-blue-400'
                : 'text-gray-600 hover:bg-blue-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`}
          >
            About Us
          </Link>

          <Link
            href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg bg-[#1565C0] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#0d47a1]"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  )
}
