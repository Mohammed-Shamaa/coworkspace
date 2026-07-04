'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/theme-provider'
import { Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-blue-100/30 bg-blue-50/60 shadow-sm shadow-blue-500/5 backdrop-blur-xl dark:border-blue-900/20 dark:bg-gray-950/70 dark:shadow-none"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-48.png" alt="Coworkspace" className="h-8 w-8" />
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Coworkspace</span>
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
    </motion.header>
  )
}
