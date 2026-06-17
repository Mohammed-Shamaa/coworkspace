'use client'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { membersApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Member } from '@/types'

interface MemberDetailModalProps {
  isOpen: boolean
  onClose: () => void
  memberId: number | null
}

export default function MemberDetailModal({ isOpen, onClose, memberId }: MemberDetailModalProps) {
  const { t } = useTranslation()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const res = await membersApi.getById(memberId!)
        if (!ignore) setMember(res.data)
      } catch (e: unknown) {
        if (!ignore) console.error(e)
      }
      if (!ignore) setLoading(false)
    }
    if (memberId) fetchData()
    return () => { ignore = true }
  }, [memberId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('members.memberDetail')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer" aria-label={t('common.close')}>
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">{t('common.loading')}</div>
        ) : member ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--datagrid-alt)] rounded-lg">
              <div><span className="font-semibold text-[var(--text-primary)]">Full Name:</span> {member.fullName}</div>
              <div><span className="font-semibold text-[var(--text-primary)]">Phone:</span> {member.phoneNumber}</div>
              <div><span className="font-semibold text-[var(--text-primary)]">National ID:</span> {member.nationalId}</div>
              <div><span className="font-semibold text-[var(--text-primary)]">Desk Number:</span> {member.deskNumber}</div>
              <div><span className="font-semibold text-[var(--text-primary)]">Member Type:</span> {member.memberType === 'RemoteWorker' ? t('dashboard.worker') : member.memberType}</div>
              {member.workerType && <div><span className="font-semibold text-[var(--text-primary)]">Worker Type:</span> {member.workerType}</div>}
              <div><span className="font-semibold text-[var(--text-primary)]">Registration Date:</span> {formatDate(member.registrationDate)}</div>
              <div><span className="font-semibold text-[var(--text-primary)]">End Date:</span> {member.noEndDate ? 'Active Until Removed' : formatDate(member.endDate)}</div>
              <div><span className="font-semibold text-[var(--text-primary)]">Attendance Plan:</span> {member.attendancePlan === 'ThreeDaysPerWeek' ? '3 Days/Week' : '6 Days/Week'}</div>
              {member.attendanceSchedule && <div><span className="font-semibold text-[var(--text-primary)]">Schedule:</span> {member.attendanceSchedule}</div>}
              <div><span className="font-semibold text-[var(--text-primary)]">Time Period:</span> {member.timePeriod}</div>
              <div><span className="font-semibold text-[var(--text-primary)]">Working Hours:</span> {member.startTime} - {member.endTime}</div>
              <div><span className="font-semibold text-[var(--text-primary)]">Monthly Fee:</span> {formatCurrency(member.monthlyFee)}</div>
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Status:</span>{' '}
                <Badge variant={member.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}>{member.paymentStatusDisplay}</Badge>
              </div>
            </div>

            {member.payments && member.payments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{t('members.paymentHistory')}</h3>
                <div className="rounded-lg border border-[var(--card-border)] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('members.paymentDate')}</TableHead>
                        <TableHead>{t('members.paymentTime')}</TableHead>
                        <TableHead>{t('members.amount')}</TableHead>
                        <TableHead>{t('members.table.status')}</TableHead>
                        <TableHead>{t('members.paidMonth')}</TableHead>
                        <TableHead>{t('members.recordedBy')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {member.payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{formatDate(p.paymentDate)}</TableCell>
                          <TableCell>{p.paymentTime}</TableCell>
                          <TableCell>{formatCurrency(p.amount)}</TableCell>
                          <TableCell><Badge variant="paid">{p.status === 'Paid' ? t('members.paid') : p.status}</Badge></TableCell>
                          <TableCell>{p.paidMonth}</TableCell>
                          <TableCell>{p.recordedByUserName || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Button variant="purple" onClick={async () => {
              const res = await membersApi.downloadPdf(member.id)
              const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
              window.open(url, '_blank')
            }}>
              <Download size={16} className="mr-2" /> {t('members.print')}
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-secondary)]">Member not found.</div>
        )}
      </div>
    </div>
  )
}
