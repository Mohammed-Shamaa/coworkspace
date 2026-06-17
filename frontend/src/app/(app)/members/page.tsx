'use client'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/lib/use-debounce'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import MembersTable from '@/components/members-table'
import EditMemberModal from '@/components/edit-member-modal'
import MemberDetailModal from '@/components/member-detail-modal'
import { membersApi } from '@/lib/api'
import type { Member } from '@/types'

const SEARCH_FILTERS = (t: (key: string) => string) => [
  { value: 'all', label: t('members.allFields') },
  { value: 'name', label: t('members.name') },
  { value: 'nationalid', label: t('members.nationalId') },
  { value: 'phone', label: t('members.phoneNumber') },
  { value: 'desk', label: t('members.deskNumber') },
]

function MembersPageContent() {
  const { t } = useTranslation()
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [detailId] = useState<number | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const loadMembers = async () => {
    try {
      const res = await membersApi.getAll({ search: debouncedSearch, filter: filter !== 'all' ? filter : undefined })
      setMembers(res.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string }
      setLoadError(error.response?.data?.error || error.message || 'Failed to load members')
      console.error(err)
    }
  }

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const res = await membersApi.getAll({ search: debouncedSearch, filter: filter !== 'all' ? filter : undefined })
        if (!ignore) setMembers(res.data)
      } catch (err: unknown) {
        if (!ignore) {
          const error = err as { response?: { data?: { error?: string } }; message?: string }
          setLoadError(error.response?.data?.error || error.message || 'Failed to load members')
          console.error(err)
        }
      }
      if (!ignore) setLoading(false)
    }
    fetchData()
    return () => { ignore = true }
  }, [debouncedSearch, filter])

  const handleEdit = (member: Member) => {
    setEditMember(member)
    setShowEdit(true)
  }

  const handlePdf = async (member: Member) => {
    try {
      const res = await membersApi.downloadPdf(member.id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      window.open(url, '_blank')
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (member: Member) => {
    if (!confirm(t('members.confirmDelete', { name: member.fullName }))) return
    try {
      await membersApi.delete(member.id)
      loadMembers()
    } catch (err) { console.error(err) }
  }

  const handleMarkPaid = async (member: Member) => {
    try {
      await membersApi.markPaid(member.id)
      loadMembers()
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{t('members.title')}</h1>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-sm font-semibold text-[var(--text-primary)]">{t('members.searchBy')}</span>
        <Select options={SEARCH_FILTERS(t)} value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className="w-64"
        />
        <div className="flex-1" />
        <Button variant="success" onClick={async () => {
          try {
            const res = await membersApi.exportExcel()
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
            const a = document.createElement('a')
            a.href = url
            a.download = `Members_Export_${new Date().toISOString().slice(0, 10)}.xlsx`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          } catch (err) { console.error(err) }
        }}>
          {t('members.exportExcel')}
        </Button>
      </div>

      {loadError ? (
        <div className="bg-[var(--error-bg)] text-[var(--error-text)] p-4 rounded-lg border border-red-200">
          <p className="font-semibold">{t('common.error') || 'Error'}</p>
          <p className="text-sm mt-1">{loadError}</p>
        </div>
      ) : loading ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">{t('members.loading')}</div>
      ) : (
        <MembersTable
          members={members}
          onEdit={handleEdit}
          onPdf={handlePdf}
          onDelete={handleDelete}
          onMarkPaid={handleMarkPaid}
        />
      )}

      <EditMemberModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        member={editMember}
        onSuccess={loadMembers}
      />
      <MemberDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        memberId={detailId}
      />
    </div>
  )
}

export default function MembersPage() {
  return <MembersPageContent />
}
