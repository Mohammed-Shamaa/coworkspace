'use client'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import type { AdminTenant } from '@/types'

export default function PaymentsPage() {
  const { isSuperAdmin } = useAuth()
  const [tenants, setTenants] = useState<AdminTenant[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState('')

  const fetch = async () => {
    try {
      const res = await adminApi.getPayments()
      setTenants(res.data.data)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      setError(axiosErr.response?.data?.message || axiosErr.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSuperAdmin) fetch()
  }, [isSuperAdmin])

  const handlePaymentStatus = async (id: number, status: string) => {
    setActionLoading(id)
    try {
      await adminApi.updatePaymentStatus(id, status)
      await fetch()
    } catch {
      setError('Failed to update payment status')
    } finally {
      setActionLoading(null)
    }
  }

  if (!isSuperAdmin) return <div className="text-center py-20 text-[var(--text-secondary)]">Access denied.</div>

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    )
  }

  const isExpired = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-7 h-7 text-purple-500" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payment Management</h1>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] dark:bg-[#3A1B1B] text-[#C62828] dark:text-[#EF9A9A] p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {tenants.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-secondary)]">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No tenants found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map(t => {
            const expired = isExpired(t.subscriptionExpiryDate)
            return (
              <div key={t.id} className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{t.companyName}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{t.adminEmail}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                      <span className={`flex items-center gap-1 ${expired ? 'text-red-500' : 'text-green-500'}`}>
                        {expired ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {expired ? 'Expired' : t.paymentStatus}
                      </span>
                      {t.subscriptionExpiryDate && (
                        <span>Expires: {new Date(t.subscriptionExpiryDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {expired && (
                      <Button
                        onClick={() => handlePaymentStatus(t.id, 'Active')}
                        disabled={actionLoading === t.id}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 gap-2"
                      >
                        {actionLoading === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Restore Access
                      </Button>
                    )}
                    {t.paymentStatus === 'Active' && (
                      <Button
                        onClick={() => handlePaymentStatus(t.id, 'Expired')}
                        disabled={actionLoading === t.id}
                        size="sm"
                        variant="outline"
                        className="gap-2 text-red-600 border-red-300"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Mark Expired
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
