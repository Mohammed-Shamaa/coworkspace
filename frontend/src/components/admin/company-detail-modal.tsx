'use client'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { CompanyDetail } from '@/types'
import { X } from 'lucide-react'

export default function CompanyDetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const [data, setData] = useState<CompanyDetail | null>(null)

  useEffect(() => {
    adminApi.getCompanyDetail(id).then(res => setData(res.data)).catch(() => {})
  }, [id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-xl border border-[var(--card-border)] w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{data?.companyName || 'Company Details'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
        </div>
        {data ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Name" value={data.companyName} />
              <Field label="Subdomain" value={data.subdomain} />
              <Field label="Owner" value={data.ownerName} />
              <Field label="Email" value={data.email} />
              <Field label="Phone" value={data.phoneNumber} />
              <Field label="Status" value={data.status} />
              <Field label="Country" value={data.country} />
              <Field label="City" value={data.city} />
              <Field label="Address" value={data.fullAddress} />
              <Field label="Registered" value={data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-'} />
              <Field label="Approval Date" value={data.approvalDate ? new Date(data.approvalDate).toLocaleDateString() : '-'} />
              <Field label="Approved By" value={data.approvedByName || '-'} />
            </div>
            <div className="border-t border-[var(--card-border)] pt-4">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Workspace Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Capacity" value={data.workspaceCapacity?.toString()} />
                <Field label="Offices" value={data.numberOfOffices?.toString()} />
                <Field label="Meeting Rooms" value={data.numberOfMeetingRooms?.toString()} />
                <Field label="Desks" value={data.numberOfDesks?.toString()} />
                <Field label="Users" value={data.userCount.toString()} />
                <Field label="Members" value={data.memberCount.toString()} />
              </div>
              {data.workspaceDescription && (
                <div className="mt-3">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Description</p>
                  <p className="text-sm text-[var(--text-primary)]">{data.workspaceDescription}</p>
                </div>
              )}
            </div>
            {data.rejectionReason && (
              <div className="border-t border-[var(--card-border)] pt-4">
                <h3 className="font-semibold text-red-600 mb-1">Rejection Reason</h3>
                <p className="text-sm text-[var(--text-primary)]">{data.rejectionReason}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-[var(--text-secondary)]">Loading...</div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="text-sm font-medium text-[var(--text-primary)]">{value || '-'}</p>
    </div>
  )
}
