'use client'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Building2, Loader2, Users, CheckCircle, Clock } from 'lucide-react'
import type { AdminTenant } from '@/types'

export default function WorkspacesPage() {
  const { isSuperAdmin } = useAuth()
  const [workspaces, setWorkspaces] = useState<AdminTenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSuperAdmin) return
    const fetch = async () => {
      try {
        const res = await adminApi.getActiveWorkspaces()
        setWorkspaces(res.data.data)
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
        setError(axiosErr.response?.data?.message || axiosErr.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [isSuperAdmin])

  if (!isSuperAdmin) return <div className="text-center py-20 text-[var(--text-secondary)]">Access denied.</div>

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-7 h-7 text-blue-500" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Active Workspaces</h1>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] dark:bg-[#3A1B1B] text-[#C62828] dark:text-[#EF9A9A] p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {workspaces.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-secondary)]">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No approved workspaces</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workspaces.map(ws => (
            <div key={ws.id} className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{ws.companyName}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{ws.adminEmail}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Approved</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ws.memberCount ?? 0} members</span>
                    {ws.trialStartDate && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Trial: {new Date(ws.trialStartDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  ws.paymentStatus === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                  ws.paymentStatus === 'Trial' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {ws.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
