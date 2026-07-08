'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/lib/theme-provider'
import '@/lib/i18n'
import {
  LayoutDashboard, Users, CreditCard, GraduationCap,
  Briefcase, Clock, Settings, LogOut, Globe, Sun, Moon,
  Presentation, Shield
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const { tenant, logout, isSuperAdmin } = useAuth()
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const navItems = useMemo(() => {
    const items = [
      { href: '/dashboard', labelKey: 'sidebar.home', icon: LayoutDashboard },
      { href: '/members', labelKey: 'sidebar.members', icon: Users },
      { href: '/unpaid', labelKey: 'sidebar.unpaid', icon: CreditCard },
      { href: '/students', labelKey: 'sidebar.students', icon: GraduationCap },
      { href: '/workers', labelKey: 'sidebar.workers', icon: Briefcase },
      { href: '/expired', labelKey: 'sidebar.expired', icon: Clock },
      { href: '/settings', labelKey: 'sidebar.settings', icon: Settings },
    ]
    if (tenant?.hasMeetingRoom) {
      items.splice(3, 0, { href: '/meeting-room', labelKey: 'sidebar.meetingRoom', icon: Presentation })
    }
    if (isSuperAdmin) {
      items.unshift({ href: '/admin', labelKey: 'sidebar.adminPanel', icon: Shield })
    }
    return items
  }, [tenant?.hasMeetingRoom, isSuperAdmin])

  return (
    <aside
      className="w-16 md:w-64 min-h-screen flex flex-col shrink-0 relative"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <div className="p-3 md:p-6 border-b border-white/10">
        <h1 className="text-xs md:text-xl font-bold text-center md:text-left truncate text-white">
          {tenant?.companyName?.[0] || 'C'}
        </h1>
        <p className="hidden md:block text-xs text-[var(--sidebar-text-muted)] mt-1">{t('sidebar.membershipManager')}</p>
      </div>

      <nav className="flex-1 py-2 md:py-4 space-y-0.5 md:space-y-1 px-1.5 md:px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-[var(--sidebar-active)] text-white shadow-sm'
                  : 'text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-white'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'transition-all duration-200',
                  isActive ? 'text-white' : 'text-[var(--sidebar-text-muted)] group-hover:text-white group-hover:scale-110'
                )}
              />
              <span className="hidden md:inline">{t(item.labelKey)}</span>
              {isActive && (
                <span className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-white/50" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-2 md:p-4 border-t border-white/10 space-y-1">
        <div className="hidden md:block text-xs text-[var(--sidebar-text-muted)] mb-2 truncate px-2">{tenant?.companyName}</div>
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 w-full cursor-pointer text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-white group"
        >
          {theme === 'dark' ? <Sun size={16} className="transition-transform duration-200 group-hover:rotate-45" /> : <Moon size={16} className="transition-transform duration-200 group-hover:-rotate-12" />}
          <span className="hidden md:inline">{t('common.' + (theme === 'dark' ? 'lightMode' : 'darkMode'))}</span>
        </button>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
          className="flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 w-full cursor-pointer text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-white group"
        >
          <Globe size={16} className="transition-transform duration-200 group-hover:scale-110" />
          <span className="hidden md:inline">{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
        <button
          onClick={logout}
          className="flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 w-full cursor-pointer text-[var(--sidebar-text-muted)] hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="hidden md:inline">{t('sidebar.signOut')}</span>
        </button>
      </div>
    </aside>
  )
}
