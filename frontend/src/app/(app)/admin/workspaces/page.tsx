'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useInterval } from '@/hooks/useInterval'
import { AnimatePresence, motion } from 'framer-motion'
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

      {/* Detail drawer */}
      {selectedId && (
        <AnimatePresence>
          <>
            <motion.div
              key="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={closeDetail}
            />
            <motion.div
              key="drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed z-50 bg-[var(--card-bg)] shadow-2xl overflow-hidden
                inset-x-0 bottom-0 max-h-[88vh] rounded-t-2xl
                md:inset-y-4 md:right-4 md:left-auto md:bottom-auto md:max-h-[calc(100vh-2rem)] md:w-full md:max-w-lg md:rounded-2xl md:border md:border-[var(--card-border)]"
            >
              <div className="flex flex-col h-full max-h-[88vh] md:max-h-[calc(100vh-2rem)]">
                {/* Handle bar (mobile only) */}
                <div className="flex justify-center pt-2.5 pb-1 md:hidden">
                  <div className="w-10 h-1 rounded-full bg-[var(--text-secondary)]/30" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--card-border)] shrink-0">
                  <button onClick={closeDetail} className="p-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                  </button>
                  <h2 className="font-bold text-lg text-[var(--text-primary)]">{t('admin.workspaces.detail.title')}</h2>
                  <div className="w-9" />
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {detailLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 animate-spin text-[#1565C0]" />
                    </div>
                  ) : detail ? (
                    <div className="space-y-4 pb-4">
                      {/* Hero section */}
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg font-bold shrink-0">
                              {(detail.companyName || 'W').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-bold truncate">{detail.companyName}</h3>
                              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                                <User className="w-3.5 h-3.5" />
                                <span className="truncate">{detail.adminName || detail.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              detail.paymentStatus === 'Active' ? 'bg-green-400/20 text-green-100 border border-green-300/30' :
                              detail.paymentStatus === 'Trial' ? 'bg-blue-400/20 text-blue-100 border border-blue-300/30' :
                              'bg-red-400/20 text-red-100 border border-red-300/30'
                            }`}>
                              {detail.paymentStatus === 'Active' ? t('admin.workspaces.paid') : detail.paymentStatus}
                            </span>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30">
                              {detail.status}
                            </span>
                            {detail.isLocked && (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-100 border border-amber-300/30 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact info */}
                      <div className="bg-[var(--hover-bg)] rounded-xl p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">{t('admin.workspaces.detail.contactInfo')}</h4>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                              <Mail className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <span className="truncate">{detail.adminEmail || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                            <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                              <Phone className="w-3.5 h-3.5 text-green-500" />
                            </div>
                            <span>{detail.whatsappNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                              <Hash className="w-3.5 h-3.5 text-purple-500" />
                            </div>
                            <span>{detail.subdomain}.deskora.com</span>
                          </div>
                          {detail.address && (
                            <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                              </div>
                              <span>{detail.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[var(--hover-bg)] rounded-xl p-3.5 text-center">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                            <Users className="w-4.5 h-4.5 text-blue-500" />
                          </div>
                          <div className="text-xl font-bold text-[var(--text-primary)]">{detail.memberCount}</div>
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t('admin.workspaces.detail.members')}</div>
                        </div>
                        <div className="bg-[var(--hover-bg)] rounded-xl p-3.5 text-center">
                          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                            <Calendar className="w-4.5 h-4.5 text-green-500" />
                          </div>
                          <div className="text-xl font-bold text-[var(--text-primary)]">{detail.meetingRoomReservationCount}</div>
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t('admin.workspaces.detail.meetingReservations')}</div>
                        </div>
                        <div className="bg-[var(--hover-bg)] rounded-xl p-3.5 text-center">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
                            <Building2 className="w-4.5 h-4.5 text-purple-500" />
                          </div>
                          <div className="text-xl font-bold text-[var(--text-primary)]">{detail.totalDesks ?? 'N/A'}</div>
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t('admin.workspaces.detail.totalDesks')}</div>
                        </div>
                        <div className="bg-[var(--hover-bg)] rounded-xl p-3.5 text-center">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                            <FileText className="w-4.5 h-4.5 text-amber-500" />
                          </div>
                          <div className="text-xl font-bold text-[var(--text-primary)]">{detail.maxCapacity ?? 'N/A'}</div>
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t('admin.workspaces.detail.maxCapacity')}</div>
                        </div>
                      </div>

                      {/* Subscription */}
                      <div className="bg-[var(--hover-bg)] rounded-xl p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">{t('admin.workspaces.detail.subscription')}</h4>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--text-secondary)]">{t('admin.workspaces.detail.registered')}</span>
                            <span className="text-[var(--text-primary)] font-medium">{detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--text-secondary)]">{t('admin.workspaces.detail.trialStart')}</span>
                            <span className="text-[var(--text-primary)] font-medium">{detail.trialStartDate ? new Date(detail.trialStartDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--text-secondary)]">{t('admin.workspaces.detail.trialRemaining')}</span>
                            {(() => { const d = remainingTrialDays(detail.trialStartDate); return d != null ? (
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all ${d <= 0 ? 'bg-red-500 w-full' : d <= 7 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: d <= 0 ? '100%' : `${Math.min(100, (d / 30) * 100)}%` }} />
                                </div>
                                <span className={`font-medium ${d <= 0 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                                  {d <= 0 ? t('admin.workspaces.ended') : t('admin.workspaces.days', { days: d })}
                                </span>
                              </div>
                            ) : <span className="text-[var(--text-primary)]">N/A</span> })()}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--text-secondary)]">{t('admin.workspaces.detail.subscriptionExpiry')}</span>
                            <span className={`font-medium ${isExpired(detail.subscriptionExpiryDate) ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                              {detail.subscriptionExpiryDate ? new Date(detail.subscriptionExpiryDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--text-secondary)]">{t('admin.workspaces.detail.approved')}</span>
                            <span className="text-[var(--text-primary)] font-medium">{detail.approvalDate ? new Date(detail.approvalDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-[var(--hover-bg)] rounded-xl p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">{t('admin.workspaces.detail.paymentControls')}</h4>
                        {detail.isLocked && (
                          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2.5 mb-3">
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                            <span>{t('admin.workspaces.detail.workspaceLocked')}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {detail.isLocked ? (
                            <Button
                              onClick={async () => { try { await adminApi.unlockTenant(detail.id); await fetchWorkspaces(); if (selectedId) await openDetail(detail.id) } catch { setError(t('admin.error.failedToUnlock')) } }}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-xs"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              {t('admin.workspaces.detail.unlockWorkspace')}
                            </Button>
                          ) : (
                            <Button
                              onClick={async () => { try { await adminApi.lockTenant(detail.id); await fetchWorkspaces(); if (selectedId) await openDetail(detail.id) } catch { setError(t('admin.error.failedToLock')) } }}
                              size="sm"
                              variant="outline"
                              className="gap-2 text-amber-600 border-amber-300 text-xs"
                            >
                              <Lock className="w-3.5 h-3.5" />
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
                              {actionLoading === detail.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
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
                              <AlertTriangle className="w-3.5 h-3.5" />
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
                            {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            {t('admin.workspaces.detail.exportPdf')}
                          </Button>
                        </div>
                      </div>

                      {/* Recent members */}
                      {detail.recentMembers.length > 0 && (
                        <div className="bg-[var(--hover-bg)] rounded-xl p-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">{t('admin.workspaces.detail.recentMembers')}</h4>
                          <div className="space-y-2">
                            {detail.recentMembers.map(m => (
                              <div key={m.id} className="flex items-center justify-between bg-[var(--card-bg)] rounded-lg p-3 border border-[var(--card-border)]">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {m.fullName?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">{m.fullName}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">{m.memberType}</div>
                                  </div>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
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
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--hover-bg)] rounded-xl p-3">
                          <Clock className="w-4 h-4 shrink-0" />
                          {t('admin.workspaces.detail.workingHours', { open: detail.openingTime, close: detail.closingTime })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-[var(--text-secondary)]">{t('admin.workspaces.detail.failedToLoad')}</div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        </AnimatePresence>
      )}
    </div>
  )
}
