'use client'
import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/lib/use-debounce'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { membersApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Member } from '@/types'

function ExpiredContent() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const loadExpired = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await membersApi.getAll({ search: debouncedSearch, expired: true })
      setMembers(res.data)
    } catch (err: any) {
      setLoadError(err.response?.data?.error || err.message || 'Failed to load expired members')
      console.error(err)
    }
    finally { setLoading(false) }
  }, [debouncedSearch])

  useEffect(() => { loadExpired() }, [loadExpired])

  const handleMarkPaid = async (member: Member) => {
    await membersApi.markPaid(member.id, { recordedByUserId: user?.id })
    loadExpired()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#C62828] mb-4">{t('expired.title')}</h1>

      <div className="mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
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
                <TableHead>{t('members.table.regDate')}</TableHead>
                <TableHead>{t('memberForm.endDate')}</TableHead>
                <TableHead>{t('members.table.status')}</TableHead>
                <TableHead className="text-right">{t('members.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-[var(--text-secondary)]">
                    {t('expired.noExpired')}
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
                    <TableCell>{formatDate(member.registrationDate)}</TableCell>
                    <TableCell>{formatDate(member.endDate)}</TableCell>
                        <TableCell><Badge variant="unpaid">{t('expired.expired')}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="success" size="sm" onClick={() => handleMarkPaid(member)}>
                          {t('expired.paid')}
                        </Button>
                      </div>
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

export default function ExpiredPage() {
  return <ExpiredContent />
}
