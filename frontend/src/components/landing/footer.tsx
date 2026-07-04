import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 bg-white py-12 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <Image src="/logo-48.png" alt="Deskora" width={32} height={32} className="h-8 w-8" />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Deskora</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Home</Link>
            <Link href="/auth/login" className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Login</Link>
            <Link href="/auth/register" className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Register</Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:text-gray-500">
          &copy; {year} Deskora. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
