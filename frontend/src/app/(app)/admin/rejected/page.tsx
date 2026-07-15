'use client'
import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2, Building2, Phone, Mail, MapPin, Hash, Search, X, RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

interface RejectedTenant {
  id: number
  name: string
  companyName: string
  subdomain: string
  whatsappNumber: string
  address: string
  totalDesks: number | null
  maxCapacity: number | null
  hasMeetingRoom: boolean
  createdAt: string
  updatedAt: string
  adminEmail: string | null
  adminName: string | null
}

export default function RejectedWorkspacesPage() {
  const { isSuperAdmin } = useAuth()
  const [tenants, setTenants] = useState<RejectedTenant[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const pageSize = 20
  const { t } = useTranslation()

  const fetchTenants = useCallback(async () => {
    if (!isSuperAdmin) return
    setLoading(true)
    setError('')
    try {
      const res = await adminApi.getRejectedWorkspaces({ q: searchInput, page, pageSize })
      setTenants(res.data.data)
      setTotalCount(res.data.totalCount)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      setError(axiosErr.response?.data?.message || axiosErr.message || t('admin.error.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }, [isSuperAdmin, searchInput, page])

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const handleRestore = async (id: number) => {
    setActionLoading(id)
    setError('')
    setSuccessMsg('')
    try {
      await adminApi.restoreTenant(id)
      setTenants(prev => prev.filter(t => t.id !== id))
      setTotalCount(prev => prev - 1)
      setSuccessMsg(t('admin.rejected.restored'))
    } catch {
      setError(t('admin.error.failedToRestore'))
    } finally {
      setActionLoading(null)
    }
  }

  const handlePermanentDelete = async (id: number) => {
    setActionLoading(id)
    setError('')
    setSuccessMsg('')
    try {
      await adminApi.permanentDeleteTenant(id)
      setTenants(prev => prev.filter(t => t.id !== id))
      setTotalCount(prev => prev - 1)
      setConfirmDeleteId(null)
      setSuccessMsg(t('admin.rejected.deleted'))
    } catch {
      setError(t('admin.error.failedToDelete'))
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (!isSuperAdmin) return <div className="text-center py-20 text-[var(--text-secondary)]">{t('admin.accessDenied')}</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <XCircle className="w-7 h-7 text-red-500" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('admin.rejected.title')}</h1>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] dark:bg-[#3A1B1B] text-[#C62828] dark:text-[#EF9A9A] p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {successMsg && (
        <div className="bg-[#E8F5E9] dark:bg-[#1B3A1B] text-[#2E7D32] dark:text-[#A5D6A7] p-3 rounded-lg mb-4 text-sm">{successMsg}</div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder={t('admin.rejected.searchPlaceholder')}
          value={searchInput}
          onChange={e => { setSearchInput(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-4 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#1565C0]/50 transition-colors"
        />
        {searchInput && (
          <button onClick={() => { setSearchInput(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-secondary)]">
          <XCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">{searchInput ? t('admin.rejected.noMatch') : t('admin.rejected.noRejected')}</p>
          <p className="text-sm">{t('admin.rejected.noRejectedDesc')}</p>
        </div>
      ) : (
        <>
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
                        {t('admin.rejected.desks', { total: tenant.totalDesks, max: tenant.maxCapacity })}
                      </div>
                    )}
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      {t('admin.rejected.registered')}: {new Date(tenant.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Button
                      onClick={() => handleRestore(tenant.id)}
                      disabled={actionLoading === tenant.id}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2"
                      size="sm"
                    >
                      {actionLoading === tenant.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {actionLoading === tenant.id ? t('admin.rejected.restoring') : t('admin.rejected.restore')}
                    </Button>
                    {confirmDeleteId === tenant.id ? (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handlePermanentDelete(tenant.id)}
                          disabled={actionLoading === tenant.id}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white gap-2 text-xs"
                        >
                          {actionLoading === tenant.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          {t('common.confirm')}
                        </Button>
                        <Button
                          onClick={() => setConfirmDeleteId(null)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setConfirmDeleteId(tenant.id)}
                        variant="outline"
                        className="gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('admin.rejected.delete')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm text-[var(--text-secondary)]">
                {page} / {totalPages}
              </span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
