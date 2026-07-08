'use client'
import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, X, CheckCheck, Trash2, Loader2 } from 'lucide-react'
import { notificationApi } from '@/lib/api'
import { useInterval } from '@/hooks/useInterval'
import type { AppNotification } from '@/types'

export default function NotificationBell() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getAll({ page: 1, pageSize: 20 })
      setNotifications(res.data.data.notifications)
      setUnreadCount(res.data.data.unreadCount)
      setTotalCount(res.data.data.totalCount)
    } catch {
      // silent
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount()
      setUnreadCount(res.data.data.unreadCount)
    } catch {
      // silent
    }
  }, [])

  useInterval(fetchUnreadCount, 30000)

  useEffect(() => {
    if (showDropdown) {
      fetchNotifications()
    }
  }, [showDropdown, fetchNotifications])

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // silent
    } finally {
      setMarkingAll(false)
    }
  }

  const handleDeleteAll = async () => {
    setLoading(true)
    try {
      await notificationApi.deleteAll()
      setNotifications([])
      setUnreadCount(0)
      setTotalCount(0)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      // silent
    }
  }

  const notifIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      workspace_approved: '✅',
      member_added: '👤',
      member_removed: '🗑️',
      trial_ending_soon: '⏳',
      trial_ended: '⌛',
      subscription_expiring_soon: '⚠️',
      subscription_expired: '❌',
    }
    return iconMap[type] || '🔔'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#1565C0]/50 transition-colors"
        aria-label={t('appNotifications.title')}
      >
        <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-[var(--card-border)] sticky top-0 bg-[var(--card-bg)]">
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">{t('appNotifications.title')}</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll}
                    className="p-1.5 hover:bg-[var(--hover-bg)] rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title={t('appNotifications.markAllAsRead')}
                  >
                    {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    disabled={loading}
                    className="p-1.5 hover:bg-[var(--hover-bg)] rounded text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                    title={t('appNotifications.deleteAll')}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                )}
                <button onClick={() => setShowDropdown(false)} className="p-1.5 hover:bg-[var(--hover-bg)] rounded">
                  <X className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              </div>
            </div>
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--text-secondary)]">{t('appNotifications.noNotifications')}</div>
            ) : (
              <div className="divide-y divide-[var(--card-border)]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 hover:bg-[var(--hover-bg)] cursor-pointer transition-colors ${!n.isRead ? 'bg-[#1565C0]/5' : ''}`}
                    onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">{notifIcon(n.type)}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{n.message}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#1565C0] flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalCount > 20 && (
              <div className="p-2 text-center text-xs text-[var(--text-secondary)] border-t border-[var(--card-border)]">
                {totalCount - 20} {t('common.more')}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
