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
  Presentation, Shield, BarChart3
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
      { href: '/analytics', labelKey: 'sidebar.analytics', icon: BarChart3 },
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
    <aside className="w-16 md:w-64 min-h-screen bg-[#1A237E] text-white flex flex-col shrink-0">
      <div className="p-3 md:p-6 border-b border-[#283593] flex flex-col items-center md:items-start">
        {tenant?.logoUrl ? (
          <img src={tenant.logoUrl} alt={tenant.companyName || 'Logo'} className="w-10 h-10 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-white/20" />
        ) : (
          <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-[#283593] flex items-center justify-center text-lg md:text-3xl font-bold text-white ring-2 ring-white/20">
            {tenant?.companyName?.[0] || 'C'}
          </div>
        )}
        <h1 className="text-xs md:text-lg font-bold text-center md:text-left truncate w-full mt-2">{tenant?.companyName || t('sidebar.membershipManager')}</h1>
      </div>

      <nav className="flex-1 py-2 md:py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-center md:justify-start gap-3 px-2 md:px-6 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#283593] text-white md:border-r-4 md:border-[#1565C0]'
                  : 'text-blue-200 hover:bg-[#283593] hover:text-white'
              )}
            >
              <Icon size={18} />
              <span className="hidden md:inline">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-2 md:p-4 border-t border-[#283593]">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center md:justify-start gap-2 text-sm text-blue-200 hover:text-white transition-colors w-full cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span className="hidden md:inline">{t('common.' + (theme === 'dark' ? 'lightMode' : 'darkMode'))}</span>
        </button>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
          className="flex items-center justify-center md:justify-start gap-2 text-sm text-blue-200 hover:text-white transition-colors w-full cursor-pointer mt-2"
        >
          <Globe size={16} /> <span className="hidden md:inline">{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
        <button
          onClick={logout}
          className="flex items-center justify-center md:justify-start gap-2 text-sm text-blue-200 hover:text-white transition-colors w-full cursor-pointer mt-2"
        >
          <LogOut size={16} /> <span className="hidden md:inline">{t('sidebar.signOut')}</span>
        </button>
      </div>
    </aside>
  )
}
