'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { LanguageProvider } from '@/lib/language-provider'
import AuthBackground from '@/components/auth-background'
import { AlertCircle } from 'lucide-react'

interface FieldErrors {
  email?: string[]
  password?: string[]
  fullName?: string[]
  companyName?: string[]
  subdomain?: string[]
  general?: string[]
  [key: string]: string[] | undefined
}

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [fullAddress, setFullAddress] = useState('')
  const [workspaceCapacity, setWorkspaceCapacity] = useState('')
  const [numberOfOffices, setNumberOfOffices] = useState('')
  const [numberOfMeetingRooms, setNumberOfMeetingRooms] = useState('')
  const [numberOfDesks, setNumberOfDesks] = useState('')
  const [workspaceDescription, setWorkspaceDescription] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setFieldErrors({})

    const clientErrors: FieldErrors = {}
    if (!email.trim()) clientErrors.email = [t('errors.generic')]
    if (!password.trim() || password.length < 8) clientErrors.password = ['Password must be at least 8 characters.']
    if (!fullName.trim()) clientErrors.fullName = [t('errors.generic')]
    if (!companyName.trim()) clientErrors.companyName = [t('errors.generic')]
    if (!subdomain.trim()) clientErrors.subdomain = [t('errors.generic')]

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      setErrorMessage('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      await register({
        email, password, fullName, companyName, subdomain: subdomain.toLowerCase(),
        phoneNumber: phoneNumber || undefined,
        country: country || undefined,
        city: city || undefined,
        fullAddress: fullAddress || undefined,
        workspaceCapacity: workspaceCapacity ? parseInt(workspaceCapacity) : undefined,
        numberOfOffices: numberOfOffices ? parseInt(numberOfOffices) : undefined,
        numberOfMeetingRooms: numberOfMeetingRooms ? parseInt(numberOfMeetingRooms) : undefined,
        numberOfDesks: numberOfDesks ? parseInt(numberOfDesks) : undefined,
        workspaceDescription: workspaceDescription || undefined,
      })
      router.push('/pending-approval')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; title?: string; errors?: Record<string, string[]> } }; message?: string }
      const data = axiosErr.response?.data
      if (data) {
        if (data.errors && typeof data.errors === 'object') {
          const backendFieldErrors: FieldErrors = {}
          for (const [field, msgs] of Object.entries(data.errors)) {
            const lowerField = field.charAt(0).toLowerCase() + field.slice(1)
            backendFieldErrors[lowerField] = msgs
          }
          setFieldErrors(backendFieldErrors)
        }
        setErrorMessage(data.message || data.title || t('auth.registrationFailed'))
      } else {
        setErrorMessage(axiosErr.message || t('auth.registrationFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  const getFieldError = (field: string): string[] | undefined => {
    const direct = fieldErrors[field]
    if (direct && direct.length > 0) return direct
    const capitalized = field.charAt(0).toUpperCase() + field.slice(1)
    return fieldErrors[capitalized]
  }

  const renderField = (
    field: string,
    label: string,
    type: string = 'text',
    value: string,
    onChange: (v: string) => void,
    placeholder?: string,
    extraProps?: Record<string, unknown>
  ) => {
    const errors = getFieldError(field)
    const hasError = errors && errors.length > 0
    return (
      <div>
        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{label}</label>
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder={placeholder}
          className={hasError ? 'border-[#C62828] focus:ring-[#C62828]' : ''}
          {...extraProps}
        />
        {hasError && (
          <p className="text-xs text-[#C62828] mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors[0]}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--page-bg)] p-4">
      <AuthBackground />
      <nav className="absolute left-6 top-6 flex items-center gap-2">
        <Link
          href="/"
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:scale-[1.02] hover:bg-blue-50 hover:text-[#1565C0] dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
        >
          Home
        </Link>
        <Link
          href="/about"
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:scale-[1.02] hover:bg-blue-50 hover:text-[#1565C0] dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
        >
          About Us
        </Link>
      </nav>
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/5 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('auth.registerTitle')}</h1>
          <p className="text-[var(--text-secondary)] text-sm">{t('auth.registerSubtitle')}</p>
        </div>

        {errorMessage && (
          <div className="bg-[#FFEBEE] dark:bg-[#3A1B1B] border border-[#EF9A9A] dark:border-[#C62828] text-[#C62828] dark:text-[#EF9A9A] p-3 rounded font-semibold text-sm mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderField('companyName', t('auth.companyName'), 'text', companyName, setCompanyName, 'My Company')}
          {renderField('subdomain', t('auth.subdomainLabel') + ' ' + t('auth.subdomainHint'), 'text', subdomain, setSubdomain, t('auth.subdomainPlaceholder'))}
          {renderField('fullName', t('auth.fullName'), 'text', fullName, setFullName, 'John Doe')}
          {renderField('email', t('auth.emailLabel'), 'email', email, setEmail, 'name@example.com')}
          {renderField('password', t('auth.passwordLabel'), 'password', password, setPassword, 'Create a strong password', { minLength: 6 })}

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-[#1565C0] hover:text-[#1976D2] dark:text-blue-400 dark:hover:text-blue-300 select-none">
              Company Details (Optional)
            </summary>
            <div className="mt-3 space-y-4">
              {renderField('phoneNumber', 'Phone Number', 'tel', phoneNumber, setPhoneNumber, '+1 (555) 123-4567')}
              <div className="grid grid-cols-2 gap-3">
                {renderField('country', 'Country', 'text', country, setCountry, 'Country')}
                {renderField('city', 'City', 'text', city, setCity, 'City')}
              </div>
              <div className="col-span-2">
                {renderField('fullAddress', 'Full Address', 'text', fullAddress, setFullAddress, '123 Business Street')}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {renderField('workspaceCapacity', 'Workspace Capacity', 'number', workspaceCapacity, setWorkspaceCapacity, 'e.g. 50')}
                {renderField('numberOfOffices', 'Offices', 'number', numberOfOffices, setNumberOfOffices, 'e.g. 5')}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {renderField('numberOfMeetingRooms', 'Meeting Rooms', 'number', numberOfMeetingRooms, setNumberOfMeetingRooms, 'e.g. 3')}
                {renderField('numberOfDesks', 'Desks', 'number', numberOfDesks, setNumberOfDesks, 'e.g. 30')}
              </div>
              {renderField('workspaceDescription', 'Description', 'text', workspaceDescription, setWorkspaceDescription, 'Brief description of your workspace...')}
            </div>
          </details>

          {fieldErrors.general && fieldErrors.general.length > 0 && (
            <div className="bg-[#FFEBEE] dark:bg-[#3A1B1B] p-3 rounded text-sm text-[#C62828] dark:text-[#EF9A9A]">
              {fieldErrors.general.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('auth.creatingAccount')}
              </span>
            ) : t('auth.createAccount')}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          {t('auth.hasAccount')}{' '}
          <Link href="/auth/login" className="text-[#1565C0] font-semibold hover:underline">{t('auth.signInLink')}</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <LanguageProvider>
      <RegisterForm />
    </LanguageProvider>
  )
}
