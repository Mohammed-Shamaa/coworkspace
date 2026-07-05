'use client'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { CompanyListItem } from '@/types'
import { Ban, Trash2, Eye, RefreshCw } from 'lucide-react'
import CompanyDetailModal from './company-detail-modal'

export default function ApprovedCompanies() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const fetch = () => {
    setLoading(true)
    adminApi.getApprovedCompanies().then(res => setCompanies(res.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const suspend = async (id: number) => {
    setActionLoading(id)
    try { await adminApi.suspendCompany(id); fetch() } catch { setActionLoading(null) }
  }

  const deleteCompany = async (id: number) => {
    if (!confirm('Permanently delete this company and all its data?')) return
    setActionLoading(id)
    try { await adminApi.deleteCompany(id); fetch() } catch { setActionLoading(null) }
  }

  if (loading) return <TableSkeleton />
  if (companies.length === 0) return <EmptyState />

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-[var(--card-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-left">
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Company</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Owner</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Country</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Approved</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Status</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-t border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{c.companyName}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{c.ownerName || '-'}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{c.country || '-'}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{c.approvalDate ? new Date(c.approvalDate).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedId(c.id)}
                      className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900">
                      <Eye size={14} /> View
                    </button>
                    <button onClick={() => suspend(c.id)} disabled={actionLoading === c.id}
                      className="flex items-center gap-1 rounded-md bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900 disabled:opacity-50">
                      <Ban size={14} /> Suspend
                    </button>
                    <button onClick={() => deleteCompany(c.id)} disabled={actionLoading === c.id}
                      className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 disabled:opacity-50">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedId && <CompanyDetailModal id={selectedId} onClose={() => { setSelectedId(null); fetch() }} />}
    </>
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
      <p className="text-lg font-medium text-[var(--text-primary)]">No approved companies</p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">Approve pending applications here.</p>
    </div>
  )
}
