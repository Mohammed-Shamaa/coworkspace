'use client'
import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { adminApi } from '@/lib/api'
import { useInterval } from '@/hooks/useInterval'
import { Bell, X, Clock, FileText, CreditCard, AlertTriangle } from 'lucide-react'
import type { AdminNotification } from '@/types'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin } = useAuth()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!isSuperAdmin) return
    try {
      const res = await adminApi.getNotifications()
      setNotifications(res.data.data.notifications)
      setNotificationCount(res.data.data.totalCount)
    } catch {
      // silent
    }
  }, [isSuperAdmin])

  useInterval(fetchNotifications, isSuperAdmin ? 30000 : null)

  const notifIcon = (type: string) => {
    switch (type) {
      case 'trial_ended': return <Clock className="w-4 h-4 text-amber-500" />
      case 'subscription_expired': return <FileText className="w-4 h-4 text-red-500" />
      case 'payment_needed': return <CreditCard className="w-4 h-4 text-orange-500" />
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  if (!isSuperAdmin) return <>{children}</>

  return (
    <div className="relative">
      {isSuperAdmin && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#1565C0]/50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-3 border-b border-[var(--card-border)]">
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">Notifications</h3>
                  <button onClick={() => setShowDropdown(false)} className="p-1 hover:bg-[var(--hover-bg)] rounded">
                    <X className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[var(--text-secondary)]">No notifications</div>
                ) : (
                  <div className="divide-y divide-[var(--card-border)]">
                    {notifications.map((n, i) => (
                      <div key={i} className="p-3 hover:bg-[var(--hover-bg)]">
                        <div className="flex items-start gap-2">
                          {notifIcon(n.type)}
                          <div className="min-w-0">
                            <p className="text-sm text-[var(--text-primary)]">{n.message}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                              {new Date(n.occuredAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

