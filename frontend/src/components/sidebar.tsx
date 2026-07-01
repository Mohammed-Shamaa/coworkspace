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
  Presentation
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const { tenant, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const navItems = useMemo(() => {
    const items = [
      { href: '/', labelKey: 'sidebar.home', icon: LayoutDashboard },
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
    return items
  }, [tenant?.hasMeetingRoom])

  return (
    <aside className="w-64 min-h-screen bg-[#1A237E] text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-[#283593]">
        <h1 className="text-xl font-bold">{tenant?.companyName || 'Coworkspace'}</h1>
        <p className="text-xs text-blue-200 mt-1">{t('sidebar.membershipManager')}</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#283593] text-white border-r-4 border-[#1565C0]'
                  : 'text-blue-200 hover:bg-[#283593] hover:text-white'
              )}
            >
              <Icon size={18} />
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#283593]">
        <div className="text-xs text-blue-200 mb-2">{tenant?.companyName}</div>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors w-full cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {t('common.' + (theme === 'dark' ? 'lightMode' : 'darkMode'))}
        </button>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors w-full cursor-pointer mt-2"
        >
          <Globe size={16} /> {i18n.language === 'ar' ? 'English' : 'العربية'}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors w-full cursor-pointer mt-2"
        >
          <LogOut size={16} /> {t('sidebar.signOut')}
        </button>
      </div>
    </aside>
  )
}
