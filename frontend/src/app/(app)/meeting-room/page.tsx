'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/auth-context'
import { meetingRoomApi, setupApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Search, Plus, Trash2, Edit, X, CalendarDays, List, BarChart3, CheckCircle } from 'lucide-react'
import type { Reservation, ReservationStats } from '@/types'

function MeetingRoomContent() {
  const { t, i18n } = useTranslation()
  const { tenant } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<ReservationStats | null>(null)
  const [upcoming, setUpcoming] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [workingHours, setWorkingHours] = useState({ openingTime: '', closingTime: '' })

  const [showModal, setShowModal] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Reservation | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const messageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const initialLoadRef = useRef(false)

  const [formData, setFormData] = useState({
    personName: '',
    reservationDate: '',
    startTime: '',
    endTime: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const showMessage = useCallback((text: string, type: 'success' | 'error') => {
    if (messageTimer.current) clearTimeout(messageTimer.current)
    setMessage({ text, type })
    if (type === 'success') {
      messageTimer.current = setTimeout(() => setMessage(null), 5000)
    }
  }, [])

  const fetchReservations = useCallback(async () => {
    try {
      const params: { date?: string; search?: string } = {}
      if (filterDate) params.date = filterDate
      if (search) params.search = search

      const res = await meetingRoomApi.getAll(params)
      setReservations(res.data)
    } catch {
      showMessage(t('errors.generic'), 'error')
    }
  }, [filterDate, search, showMessage])

  const refreshStatsAndUpcoming = useCallback(async () => {
    try { setStats((await meetingRoomApi.getStats()).data) } catch { /* ignore */ }
    try { setUpcoming((await meetingRoomApi.getUpcoming()).data) } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  useEffect(() => {
    if (initialLoadRef.current) return
    initialLoadRef.current = true

    const load = async () => {
      const loadOne = async <T,>(fn: () => Promise<{ data: T }>, setter: (v: T) => void) => {
        try { setter((await fn()).data) } catch { /* ignore */ }
      }
      await Promise.all([
        loadOne(() => meetingRoomApi.getStats(), setStats),
        loadOne(() => meetingRoomApi.getUpcoming(), setUpcoming),
        loadOne(async () => {
          const res = await setupApi.getInfo()
          if (res.data.openingTime && res.data.closingTime) {
            setWorkingHours({ openingTime: res.data.openingTime, closingTime: res.data.closingTime })
          }
          return res
        }, () => {}),
      ])
      setLoading(false)
    }
    load()
    return () => { if (messageTimer.current) clearTimeout(messageTimer.current) }
  }, [])

  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const addHour = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const totalMin = h * 60 + m + 60
    const nh = Math.floor(totalMin / 60) % 24
    const nm = totalMin % 60
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
  }

  const openCreateModal = () => {
    setEditingReservation(null)
    const defaultEnd = workingHours.openingTime ? addHour(workingHours.openingTime) : '10:00'
    setFormData({
      personName: '',
      reservationDate: new Date().toISOString().split('T')[0],
      startTime: workingHours.openingTime || '09:00',
      endTime: defaultEnd,
      notes: '',
    })
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (reservation: Reservation) => {
    setEditingReservation(reservation)
    setFormData({
      personName: reservation.personName,
      reservationDate: reservation.reservationDate,
      startTime: reservation.startTime.substring(0, 5),
      endTime: reservation.endTime.substring(0, 5),
      notes: reservation.notes || '',
    })
    setFormError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    setFormError('')
    if (!formData.personName.trim() || !formData.reservationDate || !formData.startTime || !formData.endTime) {
      setFormError(t('errors.generic'))
      return
    }
    if (formData.startTime >= formData.endTime) {
      setFormError(t('errors.invalidTimeRange'))
      return
    }
    if (workingHours.openingTime && workingHours.closingTime) {
      if (parseTime(formData.startTime) < parseTime(workingHours.openingTime) ||
          parseTime(formData.endTime) > parseTime(workingHours.closingTime)) {
        setFormError(t('errors.outsideWorkingHours'))
        return
      }
    }
    const today = new Date().toISOString().split('T')[0]
    if (formData.reservationDate === today) {
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
      if (parseTime(formData.startTime) <= nowMin) {
        setFormError(t('errors.pastDate'))
        return
      }
    }

    setSaving(true)
    try {
      if (editingReservation) {
        await meetingRoomApi.update(editingReservation.id, formData)
        showMessage(t('meetingRoom.reservationUpdated'), 'success')
      } else {
        await meetingRoomApi.create(formData)
        showMessage(t('meetingRoom.reservationCreated'), 'success')
      }
      setShowModal(false)
      setEditingReservation(null)
      fetchReservations()
      refreshStatsAndUpcoming()
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || t('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await meetingRoomApi.delete(deleteConfirm.id)
      setDeleteConfirm(null)
      showMessage(t('meetingRoom.reservationDeleted'), 'success')
      fetchReservations()
      refreshStatsAndUpcoming()
    } catch {
      showMessage(t('errors.generic'), 'error')
    }
  }

  const formatTimeForDisplay = (time: string) => {
    const parts = time.split(':')
    if (parts.length < 2) return time
    const h = parseInt(parts[0])
    const m = parts[1]
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  const formatDateForDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const generateTimeSlots = () => {
    if (!workingHours.openingTime || !workingHours.closingTime) return []
    const openMin = parseTime(workingHours.openingTime)
    const closeMin = parseTime(workingHours.closingTime)
    const slots: string[] = []
    for (let m = openMin; m < closeMin; m += 30) {
      const h = Math.floor(m / 60)
      const min = m % 60
      slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
    }
    return slots
  }

  const getReservationForSlot = (slotTime: string) => {
    const slotMin = parseTime(slotTime)
    return reservations.find(r => {
      const startMin = parseTime(r.startTime.substring(0, 5))
      const endMin = parseTime(r.endTime.substring(0, 5))
      return slotMin >= startMin && slotMin < endMin
    })
  }

  const isLoadingSkeleton = loading && reservations.length === 0

  return (
    <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('meetingRoom.title')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('meetingRoom.subtitle')}
            {workingHours.openingTime && workingHours.closingTime && (
              <span className="ml-2">
                &middot; {t('meetingRoom.workspaceHours', {
                  open: formatTimeForDisplay(workingHours.openingTime),
                  close: formatTimeForDisplay(workingHours.closingTime),
                })}
              </span>
            )}
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          {t('meetingRoom.newReservation')}
        </Button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 p-3 rounded text-sm mb-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="shrink-0 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoadingSkeleton ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 overflow-hidden">
              <div className="h-1 bg-gray-200 animate-pulse" />
              <CardContent className="pt-4">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: t('meetingRoom.totalReservations'), value: stats.totalReservations, color: 'from-[#1565C0] to-[#1976D2]' },
            { label: t('meetingRoom.todaysReservations'), value: stats.todaysReservations, color: 'from-[#2E7D32] to-[#388E3C]' },
            { label: t('meetingRoom.upcomingCount'), value: stats.upcomingReservations, color: 'from-[#6A1B9A] to-[#7B1FA2]' },
            { label: t('meetingRoom.pastReservations'), value: stats.pastReservations, color: 'from-[#E65100] to-[#F57C00]' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${card.color}`} />
                <CardContent className="pt-4">
                  <p className="text-sm text-[var(--text-secondary)]">{card.label}</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{card.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('meetingRoom.viewAll')}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex bg-[var(--card-border)] rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded text-sm transition-colors ${viewMode === 'list' ? 'bg-[var(--card-bg)] shadow-sm' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded text-sm transition-colors ${viewMode === 'calendar' ? 'bg-[var(--card-bg)] shadow-sm' : ''}`}
                  >
                    <CalendarDays className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <Input
                    placeholder={t('meetingRoom.searchReservations')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
                {filterDate && (
                  <Button variant="ghost" size="sm" onClick={() => setFilterDate('')}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {isLoadingSkeleton ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-3" />
                  <p className="text-[var(--text-primary)] font-medium">{t('meetingRoom.noReservations')}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{t('meetingRoom.noReservationsDesc')}</p>
                </div>
              ) : viewMode === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--card-border)]">
                        <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">{t('meetingRoom.personName')}</th>
                        <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">{t('meetingRoom.reservationDate')}</th>
                        <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">{t('meetingRoom.startTime')}</th>
                        <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">{t('meetingRoom.endTime')}</th>
                        <th className="text-right py-3 px-2 font-semibold text-[var(--text-primary)]">{t('meetingRoom.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((res, i) => (
                        <motion.tr
                          key={res.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-[var(--card-border)] hover:bg-[var(--datagrid-alt)] transition-colors"
                        >
                          <td className="py-3 px-2 font-medium text-[var(--text-primary)]">{res.personName}</td>
                          <td className="py-3 px-2 text-[var(--text-secondary)]">{formatDateForDisplay(res.reservationDate)}</td>
                          <td className="py-3 px-2">
                            <Badge variant="default">{formatTimeForDisplay(res.startTime)}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="default">{formatTimeForDisplay(res.endTime)}</Badge>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(res)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(res)}>
                                <Trash2 className="w-4 h-4 text-[#C62828]" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {generateTimeSlots().length > 0 && (
                      <div className="space-y-0.5">
                        {generateTimeSlots().map((slot) => {
                          const res = getReservationForSlot(slot)
                          const [h, m] = slot.split(':')
                          const slotLabel = formatTimeForDisplay(slot)
                          const nextSlot = generateTimeSlots()[generateTimeSlots().indexOf(slot) + 1]
                          const isHalfHour = parseInt(m) === 30
                          const rowSpan = res && !isHalfHour ? 2 : 1
                          if (isHalfHour && res && getReservationForSlot(generateTimeSlots()[generateTimeSlots().indexOf(slot) - 1]) === res) {
                            return null
                          }
                          const showTime = parseInt(m) === 0

                          return (
                            <div
                              key={slot}
                              className={`flex items-stretch min-h-[36px] ${showTime ? '' : ''}`}
                              style={res && !isHalfHour ? { minHeight: '72px' } : {}}
                            >
                              <div className={`w-20 shrink-0 text-xs text-[var(--text-secondary)] pt-1 ${showTime ? '' : 'opacity-0'}`}>
                                {showTime ? slotLabel : slotLabel}
                              </div>
                              <div className={`flex-1 ml-2 rounded border ${res ? 'border-[#1565C0] bg-[#1565C0]/5' : 'border-transparent'} ${isHalfHour ? 'border-dashed border-gray-200' : ''}`}>
                                {res && showTime && (
                                  <div className="p-2 h-full flex items-start justify-between">
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-[#1565C0] truncate">{res.personName}</p>
                                      <p className="text-xs text-[var(--text-secondary)]">
                                        {formatTimeForDisplay(res.startTime)} - {formatTimeForDisplay(res.endTime)}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                      <button onClick={() => openEditModal(res)} className="p-1 hover:bg-[#1565C0]/10 rounded">
                                        <Edit className="w-3.5 h-3.5 text-[#1565C0]" />
                                      </button>
                                      <button onClick={() => setDeleteConfirm(res)} className="p-1 hover:bg-red-50 rounded">
                                        <Trash2 className="w-3.5 h-3.5 text-[#C62828]" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {generateTimeSlots().length === 0 && (
                      <div className="text-center py-12 text-[var(--text-secondary)]">
                        {t('errors.generic')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('meetingRoom.upcomingReservations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSkeleton ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border-l-4 border-gray-200 pl-3 py-1">
                      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-2 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
                  <p className="text-sm text-[var(--text-primary)] font-medium">{t('meetingRoom.noUpcoming')}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{t('meetingRoom.noUpcomingDesc')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((res) => (
                    <div key={res.id} className="border-l-4 border-[#1565C0] pl-3 py-1">
                      <p className="font-medium text-sm text-[var(--text-primary)]">{res.personName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatDateForDisplay(res.reservationDate)}
                      </p>
                      <p className="text-xs text-[#1565C0] font-medium">
                        {formatTimeForDisplay(res.startTime)} - {formatTimeForDisplay(res.endTime)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('meetingRoom.workingHours')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSkeleton ? (
                <div className="space-y-2">
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : workingHours.openingTime ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-[#1565C0]/5">
                    <span className="text-sm text-[var(--text-secondary)]">{t('meetingRoom.startTime')}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatTimeForDisplay(workingHours.openingTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#1565C0]/5">
                    <span className="text-sm text-[var(--text-secondary)]">{t('meetingRoom.endTime')}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatTimeForDisplay(workingHours.closingTime)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                  {t('meetingRoom.noReservations')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-0 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {editingReservation ? t('meetingRoom.editReservation') : t('meetingRoom.newReservation')}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formError && (
                    <div className="p-3 rounded bg-red-50 text-red-800 border border-red-200 text-sm">
                      {formError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      {t('meetingRoom.personName')}
                    </label>
                    <Input
                      placeholder={t('meetingRoom.personNamePlaceholder')}
                      value={formData.personName}
                      onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      {t('meetingRoom.reservationDate')}
                    </label>
                    <Input
                      type="date"
                      value={formData.reservationDate}
                      onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                        {t('meetingRoom.startTime')}
                      </label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        min={workingHours.openingTime || undefined}
                        max={workingHours.closingTime || undefined}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                        {t('meetingRoom.endTime')}
                      </label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        min={workingHours.openingTime || undefined}
                        max={workingHours.closingTime || undefined}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      {t('meetingRoom.notes')}
                    </label>
                    <textarea
                      className="flex w-full min-h-[80px] rounded border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent"
                      placeholder={t('meetingRoom.notesPlaceholder')}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                      {t('meetingRoom.cancel')}
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? t('common.saving') : editingReservation ? t('meetingRoom.updateReservation') : t('meetingRoom.saveReservation')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle>{t('meetingRoom.deleteReservation')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[var(--text-primary)]">
                    {t('meetingRoom.deleteConfirm', { name: deleteConfirm.personName })}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t('meetingRoom.deleteConfirmDesc')}
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                      {t('meetingRoom.cancel')}
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                      {t('meetingRoom.confirmDelete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MeetingRoomPage() {
  return <MeetingRoomContent />
}
