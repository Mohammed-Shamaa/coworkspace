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
        className="relative p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm transition-all duration-200 hover:border-[var(--input-focus)]/40 hover:shadow-md hover:shadow-[var(--input-focus)]/5 active:scale-95"
        aria-label={t('appNotifications.title')}
      >
        <Bell className="w-5 h-5 text-[var(--text-secondary)] transition-transform duration-200 group-hover:scale-110" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-sm shadow-red-300/50 animate-scale-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-80 rounded-xl z-50 max-h-96 overflow-hidden animate-scale-in origin-top-right"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow)'
            }}
          >
            <div className="flex items-center justify-between p-3 border-b border-[var(--card-border)] sticky top-0"
              style={{ background: 'var(--glass-bg)' }}
            >
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">{t('appNotifications.title')}</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll}
                    className="p-1.5 hover:bg-[var(--hover-bg)] rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
                    title={t('appNotifications.markAllAsRead')}
                  >
                    {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    disabled={loading}
                    className="p-1.5 hover:bg-[var(--hover-bg)] rounded-lg text-xs text-[var(--text-secondary)] hover:text-red-500 transition-all duration-200"
                    title={t('appNotifications.deleteAll')}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                )}
                <button onClick={() => setShowDropdown(false)} className="p-1.5 hover:bg-[var(--hover-bg)] rounded-lg transition-all duration-200">
                  <X className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-72">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--text-secondary)]">{t('appNotifications.noNotifications')}</div>
              ) : (
                <div className="divide-y divide-[var(--card-border)]">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 hover:bg-[var(--hover-bg)] cursor-pointer transition-all duration-200 ${!n.isRead ? 'bg-[var(--input-focus)]/5' : ''}`}
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">{notifIcon(n.type)}</span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm ${!n.isRead ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{n.message}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[var(--input-focus)] flex-shrink-0 mt-1 shadow-sm shadow-[var(--input-focus)]/50" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {totalCount > 20 && (
              <div className="p-2 text-center text-xs text-[var(--text-muted)] border-t border-[var(--card-border)]">
                {totalCount - 20} more
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
