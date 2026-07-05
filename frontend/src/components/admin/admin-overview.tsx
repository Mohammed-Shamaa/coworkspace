'use client'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { AdminDashboard } from '@/types'
import { Building2, Clock, CheckCircle2, XCircle, Ban, UserCheck, TrendingUp, Globe, DollarSign, CreditCard, MapPin, Activity } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function AdminOverview() {
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getDashboard().then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><SkeletonCards count={12} /></div>
  if (!data) return <p className="text-[var(--text-secondary)]">Failed to load dashboard data.</p>

  const maxMonthly = Math.max(...data.monthlyGrowth.map(x => x.count), 1)
  const maxCountry = Math.max(...data.companiesByCountry.map(x => x.count), 1)
  const maxCity = Math.max(...data.companiesByCity.map(x => x.count), 1)
  const maxWorkspace = Math.max(...data.workspaceDistribution.map(x => x.count), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Companies" value={data.totalCompanies} color="bg-blue-600" />
        <StatCard icon={Clock} label="Pending Requests" value={data.pendingRequests} color="bg-amber-500" />
        <StatCard icon={CheckCircle2} label="Approved" value={data.approvedCompanies} color="bg-green-600" />
        <StatCard icon={XCircle} label="Rejected" value={data.rejectedCompanies} color="bg-red-500" />
        <StatCard icon={Ban} label="Suspended" value={data.suspendedCompanies} color="bg-gray-500" />
        <StatCard icon={UserCheck} label="Active" value={data.activeCompanies} color="bg-emerald-600" />
        <StatCard icon={DollarSign} label="Paid" value={data.paidCompanies} color="bg-teal-600" />
        <StatCard icon={CreditCard} label="Unpaid" value={data.unpaidCompanies} color="bg-orange-500" />
        <StatCard icon={TrendingUp} label="Approval Rate" value={`${data.approvalRate}%`} color="bg-indigo-600" />
        <StatCard icon={Globe} label="Countries" value={data.companiesByCountry.length} color="bg-cyan-600" />
        <StatCard icon={MapPin} label="Cities" value={data.companiesByCity.length} color="bg-violet-600" />
        <StatCard icon={Activity} label="30-Day Registrations" value={data.registrationTrends.reduce((s, r) => s + r.count, 0)} color="bg-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.monthlyGrowth.length > 0 && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Monthly Growth</h3>
            <div className="space-y-2">
              {data.monthlyGrowth.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--text-secondary)] w-20 shrink-0">{m.month}</span>
                  <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(m.count / maxMonthly) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] w-8 text-right">{m.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.companiesByCountry.length > 0 && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Companies by Country</h3>
            <div className="space-y-2">
              {data.companiesByCountry.map((c) => (
                <div key={c.country} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--text-secondary)] w-24 shrink-0">{c.country}</span>
                  <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(c.count / maxCountry) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] w-8 text-right">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.companiesByCity.length > 0 && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Companies by City</h3>
            <div className="space-y-2">
              {data.companiesByCity.map((c) => (
                <div key={c.city} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--text-secondary)] w-24 shrink-0">{c.city}</span>
                  <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all"
                      style={{ width: `${(c.count / maxCity) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] w-8 text-right">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.workspaceDistribution.length > 0 && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Workspace Distribution</h3>
            <div className="space-y-2">
              {data.workspaceDistribution.map((w) => (
                <div key={w.range} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--text-secondary)] w-16 shrink-0">{w.range}</span>
                  <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{ width: `${(w.count / maxWorkspace) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] w-8 text-right">{w.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonCards({ count }: { count?: number }) {
  return Array.from({ length: count ?? 8 }).map((_, i) => (
    <div key={i} className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  ))
}
