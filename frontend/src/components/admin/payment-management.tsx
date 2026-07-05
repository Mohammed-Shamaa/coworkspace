'use client'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { CompanyListItem } from '@/types'
import { DollarSign, CreditCard, RefreshCw } from 'lucide-react'

export default function PaymentManagement() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  const fetch = () => {
    setLoading(true)
    adminApi.getPayments().then(res => setCompanies(res.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const toggleStatus = async (c: CompanyListItem) => {
    setUpdating(c.id)
    const newStatus = c.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid'
    try {
      await adminApi.updatePaymentStatus(c.id, { paymentStatus: newStatus })
      fetch()
    } catch { setUpdating(null) }
  }

  if (loading) return <PaymentSkeleton />
  if (companies.length === 0) return <PaymentEmptyState />

  const paid = companies.filter(c => c.paymentStatus === 'Paid').length
  const unpaid = companies.filter(c => c.paymentStatus !== 'Paid').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-sm">
          <p className="text-sm text-[var(--text-secondary)]">Total Companies</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{companies.length}</p>
        </div>
        <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950 p-4 shadow-sm">
          <p className="text-sm text-green-700 dark:text-green-300">Paid</p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-200">{paid}</p>
        </div>
        <div className="rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950 p-4 shadow-sm">
          <p className="text-sm text-orange-700 dark:text-orange-300">Unpaid</p>
          <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{unpaid}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--card-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-left">
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Company</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Owner</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Payment Status</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Subscription</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Action</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-t border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{c.companyName}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{c.ownerName || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.paymentStatus === 'Paid'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {c.paymentStatus === 'Paid' ? <DollarSign size={12} /> : <CreditCard size={12} />}
                    {c.paymentStatus || 'Unpaid'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">-</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStatus(c)}
                    disabled={updating === c.id}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors bg-[#1565C0] text-white hover:bg-[#1976D2] disabled:opacity-50"
                  >
                    {updating === c.id ? <RefreshCw size={12} className="animate-spin" /> : null}
                    Mark as {c.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PaymentSkeleton() {
  return <div className="space-y-4"><div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div>
}

function PaymentEmptyState() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-12 text-center">
      <DollarSign size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No Approved Companies</h3>
      <p className="text-sm text-[var(--text-secondary)]">Payment data will appear here once companies are approved.</p>
    </div>
  )
}
