'use client'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { membersApi } from '@/lib/api'

const MEMBER_TYPES = (t: any) => [
  { value: 'Student', label: t('memberForm.student') },
  { value: 'RemoteWorker', label: t('memberForm.remoteWorker') },
]
const WORKER_TYPES = (t: any) => [
  { value: 'FullTime', label: t('memberForm.fullTime') },
  { value: 'PartTime', label: t('memberForm.partTime') },
]
const ATTENDANCE_PLANS = (t: any) => [
  { value: 'ThreeDaysPerWeek', label: t('memberForm.plan3Days') },
  { value: 'SixDaysPerWeek', label: t('memberForm.plan6Days') },
]
const SCHEDULES = (t: any) => [
  { value: 'SaturdayMondayWednesday', label: t('memberForm.scheduleSatMonWed') },
  { value: 'SundayTuesdayThursday', label: t('memberForm.scheduleSunTueThu') },
]

interface MemberFormProps {
  onSuccess: () => void
  initialData?: any
  memberId?: number
}

export default function MemberForm({ onSuccess, initialData, memberId }: MemberFormProps) {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState(initialData?.fullName || '')
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '')
  const [nationalId, setNationalId] = useState(initialData?.nationalId || '')
  const [memberType, setMemberType] = useState(initialData?.memberType || 'Student')
  const [workerType, setWorkerType] = useState(initialData?.workerType || '')
  const [registrationDate, setRegistrationDate] = useState(
    initialData?.registrationDate?.split('T')[0] || new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(initialData?.endDate?.split('T')[0] || '')
  const [noEndDate, setNoEndDate] = useState(initialData?.noEndDate || false)
  const [attendancePlan, setAttendancePlan] = useState(initialData?.attendancePlan || 'ThreeDaysPerWeek')
  const [attendanceSchedule, setAttendanceSchedule] = useState(initialData?.attendanceSchedule || '')
  const [startHours, setStartHours] = useState('09')
  const [startMinutes, setStartMinutes] = useState('00')
  const [endHours, setEndHours] = useState('17')
  const [endMinutes, setEndMinutes] = useState('00')
  const [deskNumber, setDeskNumber] = useState(initialData?.deskNumber || '')
  const [monthlyFee, setMonthlyFee] = useState(initialData?.monthlyFee?.toString() || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      const [sh, sm] = (initialData.startTime || '09:00').split(':')
      const [eh, em] = (initialData.endTime || '17:00').split(':')
      setStartHours(sh)
      setStartMinutes(sm)
      setEndHours(eh)
      setEndMinutes(em)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const data: any = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      nationalId: nationalId.trim(),
      memberType,
      registrationDate: new Date(registrationDate).toISOString(),
      endDate: noEndDate ? null : (endDate ? new Date(endDate).toISOString() : null),
      noEndDate,
      attendancePlan,
      attendanceSchedule: attendancePlan === 'ThreeDaysPerWeek' ? attendanceSchedule : null,
      startTime: `${startHours.padStart(2, '0')}:${startMinutes.padStart(2, '0')}`,
      endTime: `${endHours.padStart(2, '0')}:${endMinutes.padStart(2, '0')}`,
      deskNumber: deskNumber.trim(),
      monthlyFee: parseFloat(monthlyFee),
    }
    if (memberType === 'RemoteWorker' && workerType) data.workerType = workerType

    try {
      if (memberId) {
        await membersApi.update(memberId, data)
      } else {
        await membersApi.create(data)
      }
      setSuccess(memberId ? t('memberForm.memberUpdated') : t('memberForm.memberRegistered'))
      if (!memberId) {
        setFullName(''); setPhoneNumber(''); setNationalId(''); setDeskNumber('')
        setMonthlyFee(''); setEndDate(''); setNoEndDate(false)
        setMemberType('Student'); setAttendancePlan('ThreeDaysPerWeek'); setAttendanceSchedule('')
      }
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('memberForm.failedToSave'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-[#FFF8E1] text-[#E65100] p-3 rounded font-semibold text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-[#E8F5E9] text-[#2E7D32] p-3 rounded font-semibold text-sm">{success}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.fullName')}</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.phoneNumber')}</label>
          <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required placeholder="+1234567890" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.nationalId')}</label>
          <Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.memberCategory')}</label>
          <Select options={MEMBER_TYPES(t)} value={memberType} onChange={(e) => setMemberType(e.target.value)} />
        </div>

        {memberType === 'RemoteWorker' && (
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.workerType')}</label>
            <Select options={WORKER_TYPES(t)} value={workerType} onChange={(e) => setWorkerType(e.target.value)} />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.registrationDate')}</label>
          <Input type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.endDate')}</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={noEndDate} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="noEndDate"
            checked={noEndDate}
            onChange={(e) => setNoEndDate(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="noEndDate" className="text-sm text-[var(--text-primary)]">{t('memberForm.noEndDate')}</label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.attendancePlan')}</label>
          <Select options={ATTENDANCE_PLANS(t)} value={attendancePlan} onChange={(e) => setAttendancePlan(e.target.value)} />
        </div>

        {attendancePlan === 'ThreeDaysPerWeek' && (
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.schedule3Days')}</label>
            <Select options={SCHEDULES(t)} value={attendanceSchedule} onChange={(e) => setAttendanceSchedule(e.target.value)} />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.startTime')}</label>
          <div className="flex items-center gap-1">
            <Input type="number" min="0" max="23" value={startHours} onChange={(e) => setStartHours(e.target.value)} className="w-20 text-center" />
            <span className="text-[var(--text-primary)] font-bold">:</span>
            <Input type="number" min="0" max="59" value={startMinutes} onChange={(e) => setStartMinutes(e.target.value)} className="w-20 text-center" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.endTime')}</label>
          <div className="flex items-center gap-1">
            <Input type="number" min="0" max="23" value={endHours} onChange={(e) => setEndHours(e.target.value)} className="w-20 text-center" />
            <span className="text-[var(--text-primary)] font-bold">:</span>
            <Input type="number" min="0" max="59" value={endMinutes} onChange={(e) => setEndMinutes(e.target.value)} className="w-20 text-center" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.monthlyFee')}</label>
          <Input type="number" step="0.01" min="0" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('memberForm.deskNumber')}</label>
          <Input value={deskNumber} onChange={(e) => setDeskNumber(e.target.value)} required />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? t('common.saving') : memberId ? t('memberForm.updateMember') : t('memberForm.saveMember')}
      </Button>
    </form>
  )
}
