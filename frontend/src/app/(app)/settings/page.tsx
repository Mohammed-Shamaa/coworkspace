'use client'
import { useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { tenantsApi } from '@/lib/api'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

function SettingsContent({ tenant }: { tenant: { companyName?: string; name?: string; primaryColor?: string; logoUrl?: string } | null }) {
  const { t } = useTranslation()
  const { refreshTenant } = useAuth()
  const [companyName, setCompanyName] = useState(tenant?.companyName || '')
  const [name, setName] = useState(tenant?.name || '')
  const [primaryColor, setPrimaryColor] = useState(tenant?.primaryColor || '#1565C0')
  const [logoUrl, setLogoUrl] = useState(tenant?.logoUrl || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await tenantsApi.updateSettings({ companyName, name, primaryColor, logoUrl })
      await refreshTenant()
      setMessage(t('settings.savedSuccess'))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      setMessage(error.response?.data?.message || t('settings.failedToSave'))
    } finally {
      setSaving(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage(t('settings.fileTooLarge'))
      return
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setMessage(t('settings.invalidFileType'))
      return
    }

    setUploading(true)
    setMessage('')
    try {
      const res = await tenantsApi.uploadLogo(file)
      setLogoUrl(res.data.logoUrl)
      setMessage(t('settings.logoUploaded'))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      setMessage(error.response?.data?.message || t('settings.failedToUpload'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteLogo = async () => {
    setDeleting(true)
    setMessage('')
    try {
      await tenantsApi.deleteLogo()
      setLogoUrl('')
      setMessage(t('settings.logoDeleted'))
    } catch {
      setMessage(t('settings.failedToDelete'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('settings.title')}</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('settings.tenantSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`p-3 rounded font-semibold text-sm ${
              message.includes('success') ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : 'bg-[var(--error-bg)] text-[var(--error-text)]'
            }`}>{message}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('settings.companyName')}</label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g., Acme Coworkspace" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('settings.displayName')}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., My Coworkspace" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('settings.primaryColor')}</label>
            <div className="flex items-center gap-2">
              <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-16 h-10 p-1" />
              <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" placeholder="#1565C0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('settings.logo')}</label>
            <div className="flex flex-col gap-3">
              {logoUrl ? (
                <div className="flex items-center gap-4">
                  <img src={logoUrl} alt="Logo" className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? '...' : t('common.replace')}
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleDeleteLogo} disabled={deleting}>
                      {deleting ? '...' : t('common.delete')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 text-sm">
                    {t('settings.noLogo')}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? '...' : t('common.upload')}
                  </Button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileSelect} />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('settings.saving') : t('settings.saveSettings')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  const { tenant } = useAuth()
  return <SettingsContent key={tenant?.id || 'default'} tenant={tenant} />
}
