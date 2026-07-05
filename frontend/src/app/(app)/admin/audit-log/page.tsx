import AdminLayout from '@/components/admin/admin-layout'
import AuditLogViewer from '@/components/admin/audit-log-viewer'

export default function AuditLogPage() {
  return (
    <AdminLayout>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Audit Log</h2>
      <AuditLogViewer />
    </AdminLayout>
  )
}
