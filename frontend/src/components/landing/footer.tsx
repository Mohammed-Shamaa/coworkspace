import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-12 dark:border-[var(--card-border)] dark:bg-[var(--card-bg)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <img src="/logo-48.png" alt="Coworkspace" className="h-8 w-8" />
            <span className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">Coworkspace</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-500 transition-colors hover:text-gray-900 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]">Home</Link>
            <Link href="/auth/login" className="text-gray-500 transition-colors hover:text-gray-900 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]">Login</Link>
            <Link href="/auth/register" className="text-gray-500 transition-colors hover:text-gray-900 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]">Register</Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8 text-center text-sm text-gray-400 dark:border-[var(--card-border)]">
          &copy; {new Date().getFullYear()} Coworkspace. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
