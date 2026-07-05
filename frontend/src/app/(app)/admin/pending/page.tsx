import AdminLayout from '@/components/admin/admin-layout'
import PendingCompanies from '@/components/admin/pending-companies'

export default function PendingPage() {
  return (
    <AdminLayout>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Pending Applications</h2>
      <PendingCompanies />
    </AdminLayout>
  )
}
