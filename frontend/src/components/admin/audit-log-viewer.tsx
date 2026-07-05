'use client'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { AuditLogItem } from '@/types'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [actionFilter, setActionFilter] = useState('')
  const [search, setSearch] = useState('')
  const [actions, setActions] = useState<string[]>([])
  const pageSize = 30

  const fetch = () => {
    setLoading(true)
    const params: Record<string, unknown> = { page, pageSize }
    if (actionFilter) params.action = actionFilter
    if (search.trim()) params.search = search.trim()
    adminApi.getAuditLogs(params).then(res => {
      setLogs(res.data.items)
      setTotalPages(res.data.totalPages)
      setTotalCount(res.data.totalCount)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [page, actionFilter])

  useEffect(() => {
    adminApi.getAuditLogActions().then(res => setActions(res.data)).catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetch() }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-56 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="rounded-lg bg-[#1565C0] px-3 py-2 text-xs font-medium text-white hover:bg-[#1976D2]">Search</button>
        </form>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="text-sm text-[var(--text-secondary)]">{totalCount} total logs</span>
      </div>

      {loading ? <LogSkeleton /> : logs.length === 0 ? <EmptyLogs /> : (
        <div className="overflow-x-auto rounded-xl border border-[var(--card-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-left">
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Admin</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Action</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Entity</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Details</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-4 py-3 text-[var(--text-primary)]">{log.adminName}</td>
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{log.entityType}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-secondary)]">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
              <ChevronLeft size={14} /> Previous
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    Approve: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Reject: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Suspend: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    Activate: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Edit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
      {action}
    </span>
  )
}

function LogSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
      ))}
    </div>
  )
}

function EmptyLogs() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--card-border)] p-12 text-center">
      <p className="text-lg font-medium text-[var(--text-primary)]">No audit logs found</p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">Admin actions will appear here.</p>
    </div>
  )
}
