'use client'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/lib/use-debounce'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { Input } from '@/components/ui/input'
import MembersTable from '@/components/members-table'
import { membersApi } from '@/lib/api'
import type { Member } from '@/types'

function WorkersContent() {
  const { t } = useTranslation()
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const loadWorkers = async () => {
    try {
      const res = await membersApi.getAll({ type: 'RemoteWorker', search: debouncedSearch })
      setMembers(res.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string }
      setLoadError(error.response?.data?.error || error.message || 'Failed to load workers')
      console.error(err)
    }
  }

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const res = await membersApi.getAll({ type: 'RemoteWorker', search: debouncedSearch })
        if (!ignore) setMembers(res.data)
      } catch (err: unknown) {
        if (!ignore) {
          const error = err as { response?: { data?: { error?: string } }; message?: string }
          setLoadError(error.response?.data?.error || error.message || 'Failed to load workers')
          console.error(err)
        }
      }
      if (!ignore) setLoading(false)
    }
    fetchData()
    return () => { ignore = true }
  }, [debouncedSearch])

  const handlePdf = async (member: Member) => {
    const res = await membersApi.downloadPdf(member.id)
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    window.open(url, '_blank')
  }

  const handleMarkPaid = async (member: Member) => {
    await membersApi.markPaid(member.id)
    loadWorkers()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2E7D32] mb-4">{t('workers.title')}</h1>
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

export default function WorkersPage() {
  return <WorkersContent />
}
