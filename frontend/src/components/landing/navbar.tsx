'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100/80 bg-white/75 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-48.png" alt="Coworkspace" className="h-8 w-8" />
          <span className="text-lg font-bold text-gray-900">Coworkspace</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
