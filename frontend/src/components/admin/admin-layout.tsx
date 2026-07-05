'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Clock, CheckCircle, XCircle, FileText, DollarSign, Settings, ArrowLeft } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/pending', label: 'Pending Applications', icon: Clock },
    { href: '/admin/companies', label: 'Companies', icon: CheckCircle },
    { href: '/admin/rejected', label: 'Rejected', icon: XCircle },
    { href: '/admin/payments', label: 'Payments', icon: DollarSign },
    { href: '/admin/audit-log', label: 'Audit Log', icon: FileText },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1565C0] dark:text-gray-400 dark:hover:text-blue-400 mb-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Panel</h1>
        </div>
      </div>
      <nav className="flex gap-1 border-b border-[var(--card-border)] pb-0 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-[#1565C0] text-[#1565C0] dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div>{children}</div>
    </div>
  )
}
