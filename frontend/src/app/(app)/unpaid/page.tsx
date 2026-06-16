'use client'
import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/lib/use-debounce'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { membersApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Member } from '@/types'

function UnpaidContent() {
  const { t } = useTranslation()
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const loadUnpaid = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await membersApi.getAll({ paymentStatus: 'Unpaid', search: debouncedSearch })
      setMembers(res.data)
    } catch (err: any) {
      setLoadError(err.response?.data?.error || err.message || 'Failed to load unpaid members')
      console.error(err)
    }
    finally { setLoading(false) }
  }, [debouncedSearch])

  useEffect(() => { loadUnpaid() }, [loadUnpaid])

  const handleMarkPaid = async (member: Member) => {
    try {
      await membersApi.markPaid(member.id)
      loadUnpaid()
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#C62828] mb-4">{t('unpaid.title')}</h1>

      <div className="mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.searchByName')}
          className="w-96"
        />
      </div>

      {loadError ? (
        <div className="bg-[var(--error-bg)] text-[var(--error-text)] p-4 rounded-lg border border-red-200">
          <p className="font-semibold">{t('common.error') || 'Error'}</p>
          <p className="text-sm mt-1">{loadError}</p>
        </div>
      ) : loading ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">{t('common.loading')}</div>
      ) : (
        <div className="rounded-lg border border-[var(--card-border)] overflow-hidden bg-[var(--card-bg)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('members.table.name')}</TableHead>
                <TableHead>{t('members.table.phone')}</TableHead>
                <TableHead>{t('members.table.nationalId')}</TableHead>
                <TableHead>{t('members.table.type')}</TableHead>
                <TableHead>{t('members.table.desk')}</TableHead>
                <TableHead>{t('members.table.fee')}</TableHead>
                <TableHead>{t('members.table.regDate')}</TableHead>
                <TableHead>{t('members.table.status')}</TableHead>
                <TableHead className="text-right">{t('members.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-[var(--text-secondary)]">
                    {t('unpaid.noUnpaid')}
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.fullName}</TableCell>
                    <TableCell>{member.phoneNumber}</TableCell>
                    <TableCell>{member.nationalId}</TableCell>
                    <TableCell>{member.memberType === 'RemoteWorker' ? t('dashboard.worker') : member.memberType}</TableCell>
                    <TableCell>{member.deskNumber}</TableCell>
                    <TableCell>{formatCurrency(member.monthlyFee)}</TableCell>
                    <TableCell>{formatDate(member.registrationDate)}</TableCell>
                        <TableCell><Badge variant="unpaid">{t('unpaid.paymentRequired')}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="success" size="sm" onClick={() => handleMarkPaid(member)}>
                          {t('unpaid.paymentReceived')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default function UnpaidPage() {
  return <UnpaidContent />
}
