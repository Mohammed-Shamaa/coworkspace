'use client'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { CompanyListItem } from '@/types'
import { CheckCircle2, XCircle, Eye } from 'lucide-react'

export default function PendingCompanies() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetch = () => {
    setLoading(true)
    adminApi.getPendingCompanies().then(res => setCompanies(res.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const approve = async (id: number) => {
    setActionLoading(id)
    try { await adminApi.approveCompany(id); fetch() } catch { setActionLoading(null) }
  }

  const reject = async (id: number) => {
    const reason = prompt('Optional rejection reason:')
    setActionLoading(id)
    try { await adminApi.rejectCompany(id, reason ? { reason } : undefined); fetch() } catch { setActionLoading(null) }
  }

  if (loading) return <TableSkeleton />
  if (companies.length === 0) return <EmptyState />

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--card-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900 text-left">
            <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Company</th>
            <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Owner</th>
            <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Country</th>
            <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Capacity</th>
            <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Registered</th>
            <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id} className="border-t border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-900/50">
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{c.companyName}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{c.ownerName || '-'}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{c.country || '-'}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{c.workspaceCapacity ?? '-'}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(c.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => approve(c.id)} disabled={actionLoading === c.id}
                    className="flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900 disabled:opacity-50">
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button onClick={() => reject(c.id)} disabled={actionLoading === c.id}
                    className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 disabled:opacity-50">
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--card-border)] p-12 text-center">
      <p className="text-lg font-medium text-[var(--text-primary)]">No pending applications</p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">All companies have been reviewed.</p>
    </div>
  )
}
