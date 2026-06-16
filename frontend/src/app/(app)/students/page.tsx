'use client'
import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/lib/use-debounce'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { Input } from '@/components/ui/input'
import MembersTable from '@/components/members-table'
import { membersApi } from '@/lib/api'
import type { Member } from '@/types'

function StudentsContent() {
  const { t } = useTranslation()
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const loadStudents = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await membersApi.getAll({ type: 'Student', search: debouncedSearch })
      setMembers(res.data)
    } catch (err: any) {
      setLoadError(err.response?.data?.error || err.message || 'Failed to load students')
      console.error(err)
    }
    finally { setLoading(false) }
  }, [debouncedSearch])

  useEffect(() => { loadStudents() }, [loadStudents])

  const handlePdf = async (member: Member) => {
    const res = await membersApi.downloadPdf(member.id)
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    window.open(url, '_blank')
  }

  const handleMarkPaid = async (member: Member) => {
    await membersApi.markPaid(member.id)
    loadStudents()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1565C0] mb-4">{t('students.title')}</h1>
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
        <MembersTable members={members} onPdf={handlePdf} onMarkPaid={handleMarkPaid} showActions={false} />
      )}
    </div>
  )
}

export default function StudentsPage() {
  return <StudentsContent />
}
