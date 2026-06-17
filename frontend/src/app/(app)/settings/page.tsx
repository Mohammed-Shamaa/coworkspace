'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { tenantsApi } from '@/lib/api'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

function SettingsContent() {
  const { tenant } = useAuth()
  const { t } = useTranslation()
  const [companyName, setCompanyName] = useState(tenant?.companyName || '')
  const [name, setName] = useState(tenant?.name || '')
  const [primaryColor, setPrimaryColor] = useState(tenant?.primaryColor || '#1565C0')
  const [logoUrl, setLogoUrl] = useState(tenant?.logoUrl || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!tenant) return
    const timer = setTimeout(() => {
      setCompanyName(tenant.companyName)
      setName(tenant.name)
      setPrimaryColor(tenant.primaryColor)
      setLogoUrl(tenant.logoUrl)
    }, 0)
    return () => clearTimeout(timer)
  }, [tenant])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await tenantsApi.updateSettings({ companyName, name, primaryColor, logoUrl })
      setMessage(t('settings.savedSuccess'))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      setMessage(error.response?.data?.message || t('settings.failedToSave'))
    } finally {
      setSaving(false)
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
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('settings.displayName')}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('settings.primaryColor')}</label>
            <div className="flex items-center gap-2">
              <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-16 h-10 p-1" />
              <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('settings.logoUrl')}</label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder={t('settings.logoPlaceholder')} />
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
  return <SettingsContent />
}
