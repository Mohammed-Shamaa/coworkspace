'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useInterval } from '@/hooks/useInterval'
import { Button } from '@/components/ui/button'
import {
  Building2, Loader2, Users, CheckCircle, Clock, Search, X,
  ChevronRight, FileText, CreditCard, AlertTriangle, Phone, Mail,
  Hash, MapPin, Calendar, Download, ArrowLeft, Smartphone, User, Lock, Unlock
} from 'lucide-react'
import type { AdminTenant, AdminWorkspaceDetail } from '@/types'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

export default function WorkspacesPage() {
  const { isSuperAdmin } = useAuth()
  const [workspaces, setWorkspaces] = useState<AdminTenant[]>([])
  const [filtered, setFiltered] = useState<AdminTenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<AdminWorkspaceDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const { t } = useTranslation()

  const fetchWorkspaces = useCallback(async () => {
    if (!isSuperAdmin) return
    try {
      const res = await adminApi.getActiveWorkspaces()
      setWorkspaces(res.data.data)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      setError(axiosErr.response?.data?.message || axiosErr.message || t('admin.error.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }, [isSuperAdmin])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  useInterval(fetchWorkspaces, isSuperAdmin ? 30000 : null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchInput])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(workspaces)
      return
    }
    const q = search.toLowerCase()
    setFiltered(workspaces.filter(ws =>
      ws.companyName?.toLowerCase().includes(q) ||
      ws.name?.toLowerCase().includes(q) ||
      ws.subdomain?.toLowerCase().includes(q) ||
      ws.adminEmail?.toLowerCase().includes(q) ||
      ws.adminName?.toLowerCase().includes(q) ||
      ws.whatsappNumber?.toLowerCase().includes(q)
    ))
  }, [search, workspaces])

  const openDetail = async (id: number) => {
    setSelectedId(id)
    setDetailLoading(true)
    setDetail(null)
    try {
      const res = await adminApi.getWorkspaceDetail(id)
      setDetail(res.data.data)
    } catch {
      setError(t('admin.error.failedToLoadDetail'))
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setSelectedId(null)
    setDetail(null)
  }

  const handlePaymentStatus = async (id: number, status: string) => {
    setActionLoading(id)
    try {
      await adminApi.updatePaymentStatus(id, status)
      await fetchWorkspaces()
      if (selectedId === id) await openDetail(id)
    } catch {
      setError(t('admin.error.failedToUpdatePayment'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDownloadPdf = async (id: number) => {
    setPdfLoading(true)
    try {
      const res = await adminApi.downloadWorkspacePdf(id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workspace_${id}_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      setError(t('admin.error.failedToDownloadPdf'))
    } finally {
      setPdfLoading(false)
    }
  }

  const isExpired = (date: string | null | undefined) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  const remainingTrialDays = (trialStart: string | null | undefined): number | null => {
    if (!trialStart) return null
    const start = new Date(trialStart)
    const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)
    const now = new Date()
    if (end <= now) return 0
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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
        <Building2 className="w-7 h-7 text-blue-500" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('admin.workspaces.title')}</h1>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] dark:bg-[#3A1B1B] text-[#C62828] dark:text-[#EF9A9A] p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder={t('admin.workspaces.searchPlaceholder')}
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#1565C0]/50 transition-colors"
        />
        {searchInput && (
          <button onClick={() => { setSearchInput(''); setSearch('') }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-secondary)]">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">{search ? t('admin.workspaces.noMatch') : t('admin.workspaces.noApproved')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ws => {
            const trialDays = remainingTrialDays(ws.trialStartDate)
            return (
            <div
              key={ws.id}
              onClick={() => openDetail(ws.id)}
              className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-4 hover:border-[#1565C0]/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500 shrink-0" />
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">{ws.adminName || ws.companyName}</h3>
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {ws.adminEmail || 'N/A'}</span>
                    {ws.whatsappNumber && <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {ws.whatsappNumber}</span>}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('admin.workspaces.workspace')}: <span className="text-[var(--text-primary)] font-medium">{ws.companyName}</span></p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {t('admin.workspaces.registered')}: {new Date(ws.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {t('admin.workspaces.members', { count: ws.memberCount ?? 0 })}</span>
                    {ws.totalDesks != null && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {t('admin.workspaces.capacity', { total: ws.totalDesks, max: ws.maxCapacity ?? '?' })}</span>}
                    {ws.hasMeetingRoom && <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle className="w-3 h-3" /> {t('admin.workspaces.meetingRoom')}</span>}
                    {ws.trialStartDate && trialDays != null && (
                      <span className={`flex items-center gap-1 ${trialDays <= 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        <Clock className="w-3 h-3" />
                        {trialDays <= 0 ? t('admin.workspaces.trialEnded') : t('admin.workspaces.trialDaysLeft', { days: trialDays })}
                      </span>
                    )}
                    {ws.subscriptionExpiryDate && (
                      <span className={`flex items-center gap-1 ${isExpired(ws.subscriptionExpiryDate) ? 'text-red-500' : ''}`}>
                        <CreditCard className="w-3 h-3" />
                        {isExpired(ws.subscriptionExpiryDate) ? t('admin.workspaces.expired') : t('admin.workspaces.expires', { date: new Date(ws.subscriptionExpiryDate).toLocaleDateString() })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {ws.isLocked && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    ws.paymentStatus === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    ws.paymentStatus === 'Trial' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {ws.paymentStatus === 'Active' ? t('admin.workspaces.paid') : ws.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
            )})}
        </div>
      )}

      {/* Detail slide-over */}
      {selectedId && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeDetail} />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[var(--card-bg)] border-l border-[var(--card-border)] shadow-2xl z-50 overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <button onClick={closeDetail} className="p-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
                <h2 className="font-bold text-lg text-[var(--text-primary)]">{t('admin.workspaces.detail.title')}</h2>
                <div className="w-9" />
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1565C0]" />
                </div>
              ) : detail ? (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="bg-[var(--hover-bg)] rounded-xl p-4">
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{detail.companyName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-blue-500" />
                      <p className="text-sm text-[var(--text-secondary)]">{detail.adminName || detail.name}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        detail.paymentStatus === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        detail.paymentStatus === 'Trial' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {detail.paymentStatus === 'Active' ? t('admin.workspaces.paid') : detail.paymentStatus}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {detail.status}
                      </span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span>{detail.adminEmail || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{detail.whatsappNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Hash className="w-4 h-4 shrink-0" />
                      <span>{detail.subdomain}.deskora.com</span>
                    </div>
                    {detail.address && (
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{detail.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--hover-bg)] rounded-lg p-3">
                      <div className="text-xs text-[var(--text-secondary)]">{t('admin.workspaces.detail.members')}</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{detail.memberCount}</div>
                    </div>
                    <div className="bg-[var(--hover-bg)] rounded-lg p-3">
                      <div className="text-xs text-[var(--text-secondary)]">{t('admin.workspaces.detail.meetingReservations')}</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{detail.meetingRoomReservationCount}</div>
                    </div>
                    <div className="bg-[var(--hover-bg)] rounded-lg p-3">
                      <div className="text-xs text-[var(--text-secondary)]">{t('admin.workspaces.detail.totalDesks')}</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{detail.totalDesks ?? 'N/A'}</div>
                    </div>
                    <div className="bg-[var(--hover-bg)] rounded-lg p-3">
                      <div className="text-xs text-[var(--text-secondary)]">{t('admin.workspaces.detail.maxCapacity')}</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{detail.maxCapacity ?? 'N/A'}</div>
                    </div>
                  </div>

                  {/* Subscription info */}
                  <div className="bg-[var(--hover-bg)] rounded-xl p-4 space-y-2">
                    <h4 className="font-semibold text-sm text-[var(--text-primary)]">{t('admin.workspaces.detail.subscription')}</h4>
                    <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                      <div className="flex justify-between">
                        <span>{t('admin.workspaces.detail.registered')}</span>
                        <span className="text-[var(--text-primary)]">{detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('admin.workspaces.detail.trialStart')}</span>
                        <span className="text-[var(--text-primary)]">{detail.trialStartDate ? new Date(detail.trialStartDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('admin.workspaces.detail.trialRemaining')}</span>
                        <span className={`text-[var(--text-primary)] ${(() => { const d = remainingTrialDays(detail.trialStartDate); return d != null && d <= 0 ? 'text-red-500 font-medium' : '' })()}`}>
                          {(() => { const d = remainingTrialDays(detail.trialStartDate); return d != null ? (d <= 0 ? t('admin.workspaces.ended') : t('admin.workspaces.days', { days: d })) : 'N/A' })()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('admin.workspaces.detail.subscriptionExpiry')}</span>
                        <span className={`text-[var(--text-primary)] ${isExpired(detail.subscriptionExpiryDate) ? 'text-red-500 font-medium' : ''}`}>
                          {detail.subscriptionExpiryDate ? new Date(detail.subscriptionExpiryDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('admin.workspaces.detail.approved')}</span>
                        <span className="text-[var(--text-primary)]">{detail.approvalDate ? new Date(detail.approvalDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lock/Unlock controls */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-[var(--text-primary)]">{t('admin.workspaces.detail.paymentControls')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {detail.isLocked ? (
                        <Button
                          onClick={async () => { try { await adminApi.unlockTenant(detail.id); await fetchWorkspaces(); if (selectedId) await openDetail(detail.id) } catch { setError(t('admin.error.failedToUnlock')) } }}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-xs"
                        >
                          <Unlock className="w-3 h-3" />
                          {t('admin.workspaces.detail.unlockWorkspace')}
                        </Button>
                      ) : (
                        <Button
                          onClick={async () => { try { await adminApi.lockTenant(detail.id); await fetchWorkspaces(); if (selectedId) await openDetail(detail.id) } catch { setError(t('admin.error.failedToLock')) } }}
                          size="sm"
                          variant="outline"
                          className="gap-2 text-amber-600 border-amber-300 text-xs"
                        >
                          <Lock className="w-3 h-3" />
                          {t('admin.workspaces.detail.lockWorkspace')}
                        </Button>
                      )}
                      {isExpired(detail.subscriptionExpiryDate) && (
                        <Button
                          onClick={() => handlePaymentStatus(detail.id, 'Active')}
                          disabled={actionLoading === detail.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 gap-2 text-xs"
                        >
                          {actionLoading === detail.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          {t('admin.workspaces.detail.restoreAccess')}
                        </Button>
                      )}
                      {detail.paymentStatus === 'Active' && (
                        <Button
                          onClick={() => handlePaymentStatus(detail.id, 'Expired')}
                          disabled={actionLoading === detail.id}
                          size="sm"
                          variant="outline"
                          className="gap-2 text-red-600 border-red-300 text-xs"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {t('admin.workspaces.detail.markExpired')}
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDownloadPdf(detail.id)}
                        disabled={pdfLoading}
                        size="sm"
                        variant="outline"
                        className="gap-2 text-xs"
                      >
                        {pdfLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        {t('admin.workspaces.detail.exportPdf')}
                      </Button>
                    </div>
                    {detail.isLocked && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>{t('admin.workspaces.detail.workspaceLocked')}</span>
                      </div>
                    )}
                  </div>

                  {/* Recent members */}
                  {detail.recentMembers.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-2">{t('admin.workspaces.detail.recentMembers')}</h4>
                      <div className="space-y-2">
                        {detail.recentMembers.map(m => (
                          <div key={m.id} className="flex items-center justify-between bg-[var(--hover-bg)] rounded-lg p-3">
                            <div>
                              <div className="text-sm font-medium text-[var(--text-primary)]">{m.fullName}</div>
                              <div className="text-xs text-[var(--text-secondary)]">{m.memberType}</div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              m.paymentStatus === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                              'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            }`}>
                              {m.paymentStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Working hours */}
                  {detail.openingTime && (
                    <div className="text-xs text-[var(--text-secondary)]">
                      {t('admin.workspaces.detail.workingHours', { open: detail.openingTime, close: detail.closingTime })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-[var(--text-secondary)]">{t('admin.workspaces.detail.failedToLoad')}</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
