'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Shield, User, Mail, Calendar } from 'lucide-react'

export default function AdminSettings() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText('Admin2004@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="rounded-full bg-[#1565C0] p-3">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Admin Profile</h2>
            <p className="text-sm text-[var(--text-secondary)]">Your administrator account details</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User size={16} className="text-[var(--text-secondary)]" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Name</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{user?.fullName || 'Admin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-[var(--text-secondary)]" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Email</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">Admin2004@gmail.com</p>
                <button onClick={copyEmail} className="text-xs text-[#1565C0] hover:underline">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-[var(--text-secondary)]" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Role</p>
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                SuperAdmin
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Platform Information</h2>
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p><strong className="text-[var(--text-primary)]">Platform:</strong> Deskora</p>
          <p><strong className="text-[var(--text-primary)]">Version:</strong> 1.0.0</p>
          <p><strong className="text-[var(--text-primary)]">Environment:</strong> Production</p>
          <p><strong className="text-[var(--text-primary)]">Admin Panel:</strong> Enterprise-grade company approval workflow with audit logging, payment tracking, and analytics.</p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> All admin actions are logged in the Audit Log system for transparency and security.
        </p>
      </div>
    </div>
  )
}
