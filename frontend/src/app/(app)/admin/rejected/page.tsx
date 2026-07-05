import AdminLayout from '@/components/admin/admin-layout'
import RejectedCompanies from '@/components/admin/rejected-companies'

export default function RejectedPage() {
  return (
    <AdminLayout>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Rejected Applications</h2>
      <RejectedCompanies />
    </AdminLayout>
  )
}
