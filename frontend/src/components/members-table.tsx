'use client'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Member } from '@/types'
import { Edit, FileText, Trash2, DollarSign } from 'lucide-react'

interface MembersTableProps {
  members: Member[]
  onEdit?: (member: Member) => void
  onPdf?: (member: Member) => void
  onDelete?: (member: Member) => void
  onMarkPaid?: (member: Member) => void
  showActions?: boolean
}

export default function MembersTable({
  members, onEdit, onPdf, onDelete, onMarkPaid, showActions = true
}: MembersTableProps) {
  const { t } = useTranslation()
  return (
    <div className="rounded-lg border border-[var(--card-border)] overflow-hidden bg-[var(--card-bg)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('members.table.name')}</TableHead>
            <TableHead>{t('members.table.phone')}</TableHead>
            <TableHead>{t('members.table.nationalId')}</TableHead>
            <TableHead>{t('members.table.type')}</TableHead>
            <TableHead>{t('members.table.regDate')}</TableHead>
            <TableHead>{t('members.table.plan')}</TableHead>
            <TableHead>{t('members.table.desk')}</TableHead>
            <TableHead>{t('members.table.fee')}</TableHead>
            <TableHead>{t('members.table.status')}</TableHead>
            {showActions && <TableHead className="text-right">{t('members.table.actions')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 10 : 9} className="text-center text-[var(--text-secondary)] py-8">
                {t('members.noMembers')}
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.fullName}</TableCell>
                <TableCell>{member.phoneNumber}</TableCell>
                <TableCell>{member.nationalId}</TableCell>
                <TableCell>{member.memberType === 'RemoteWorker' ? t('dashboard.worker') : member.memberType}</TableCell>
                <TableCell>{formatDate(member.registrationDate)}</TableCell>
                <TableCell>{member.attendancePlan === 'ThreeDaysPerWeek' ? t('members.plan3Days') : t('members.plan6Days')}</TableCell>
                <TableCell>{member.deskNumber}</TableCell>
                <TableCell>{formatCurrency(member.monthlyFee)}</TableCell>
                <TableCell>
                  <Badge variant={member.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}>
                    {member.paymentStatusDisplay}
                  </Badge>
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {onMarkPaid && member.paymentStatus === 'Unpaid' && (
                        <Button variant="success" size="sm" onClick={() => onMarkPaid(member)} title={t('members.markAsPaid')}>
                          <DollarSign size={14} className="mr-1" /> {t('members.paid')}
                        </Button>
                      )}
                      {onEdit && (
                        <Button variant="default" size="sm" onClick={() => onEdit(member)} title={t('members.edit')}>
                          <Edit size={14} />
                        </Button>
                      )}
                      {onPdf && (
                        <Button variant="purple" size="sm" onClick={() => onPdf(member)} title={t('members.pdf')}>
                          <FileText size={14} />
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="danger" size="sm" onClick={() => onDelete(member)} title={t('members.delete')}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
