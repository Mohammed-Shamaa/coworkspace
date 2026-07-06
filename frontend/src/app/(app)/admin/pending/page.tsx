'use client'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, XCircle, Loader2, Building2, Phone, Mail, MapPin, Hash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import type { AdminTenant } from '@/types'

export default function PendingRequestsPage() {
  const { isSuperAdmin } = useAuth()
  const [tenants, setTenants] = useState<AdminTenant[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState('')
  const { t } = useTranslation()

  const fetchTenants = async () => {
    try {
      const res = await adminApi.getPendingTenants()
      setTenants(res.data.data)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      setError(axiosErr.response?.data?.message || axiosErr.message || t('admin.error.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSuperAdmin) fetchTenants()
  }, [isSuperAdmin])

  const handleApprove = async (id: number) => {
    setActionLoading(id)
    try {
      const res = await adminApi.approveTenant(id)
      setTenants(prev => prev.filter(t => t.id !== id))
      const data = res.data
      if (data.emailSent) {
        setError('')
      } else if (data.emailError === 'timeout') {
        setError(t('admin.error.approvedEmailTimeout'))
      } else if (data.emailError) {
        setError(t('admin.error.approvedEmailFailed', { error: data.emailError }))
      }
    } catch {
      setError(t('admin.error.failedToApprove'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: number) => {
    setActionLoading(id)
    try {
      await adminApi.rejectTenant(id)
      setTenants(prev => prev.filter(t => t.id !== id))
    } catch {
      setError(t('admin.error.failedToReject'))
    } finally {
      setActionLoading(null)
    }
  }

  if (!isSuperAdmin) return <div className="text-center py-20 text-[var(--text-secondary)]">{t('admin.accessDenied')}</div>

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-7 h-7 text-amber-500" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('admin.pending.title')}</h1>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] dark:bg-[#3A1B1B] text-[#C62828] dark:text-[#EF9A9A] p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {tenants.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-secondary)]">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <p className="text-lg font-medium">{t('admin.pending.noPending')}</p>
          <p className="text-sm">{t('admin.pending.noPendingDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tenants.map(tenant => (
            <div key={tenant.id} className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{tenant.companyName}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3 text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span>{tenant.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 shrink-0" />
                      <span>{tenant.subdomain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{tenant.whatsappNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span>{tenant.adminEmail || 'N/A'}</span>
                    </div>
                    {tenant.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{tenant.address}</span>
                      </div>
                    )}
                  </div>
                  {tenant.totalDesks && (
                    <div className="mt-2 text-xs text-[var(--text-secondary)]">
                      {t('admin.pending.desks', { total: tenant.totalDesks, max: tenant.maxCapacity })}
                      {tenant.hasMeetingRoom ? t('admin.pending.meetingRoom') : ''}
                      {tenant.openingTime ? t('admin.pending.hours', { open: tenant.openingTime, close: tenant.closingTime }) : ''}
                    </div>
                  )}
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    {t('admin.pending.registered')}: {new Date(tenant.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => handleApprove(tenant.id)}
                    disabled={actionLoading === tenant.id}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    size="sm"
                  >
                    {actionLoading === tenant.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {t('admin.pending.approve')}
                  </Button>
                  <Button
                    onClick={() => handleReject(tenant.id)}
                    disabled={actionLoading === tenant.id}
                    variant="outline"
                    className="gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('admin.pending.reject')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
