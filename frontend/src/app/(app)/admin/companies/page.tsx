import AdminLayout from '@/components/admin/admin-layout'
import ApprovedCompanies from '@/components/admin/approved-companies'

export default function CompaniesPage() {
  return (
    <AdminLayout>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Approved Companies</h2>
      <ApprovedCompanies />
    </AdminLayout>
  )
}
