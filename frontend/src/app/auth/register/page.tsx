'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeProvider } from '@/lib/theme-provider'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { LanguageProvider } from '@/lib/language-provider'
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
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const fieldLabels: Record<string, string> = {
    email: t('auth.emailLabel'),
    password: t('auth.passwordLabel'),
    fullName: t('auth.fullName'),
    companyName: t('auth.companyName'),
    subdomain: t('auth.subdomainLabel'),
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setFieldErrors({})

    const clientErrors: FieldErrors = {}
    if (!email.trim()) clientErrors.email = [t('errors.generic')]
    if (!password.trim() || password.length < 6) clientErrors.password = [t('errors.generic')]
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
      await register({ email, password, fullName, companyName, subdomain: subdomain.toLowerCase() })
      router.push('/')
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        if (data.errors && typeof data.errors === 'object') {
          const backendFieldErrors: FieldErrors = {}
          const errorEntries = Object.entries(data.errors)
          for (const [field, msgs] of errorEntries) {
            const lowerField = field.charAt(0).toLowerCase() + field.slice(1)
            backendFieldErrors[lowerField] = msgs as string[]
          }
          setFieldErrors(backendFieldErrors)
        }
        setErrorMessage(data.message || data.title || t('auth.registrationFailed'))
      } else {
        setErrorMessage(err.message || t('auth.registrationFailed'))
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
    extraProps?: Record<string, any>
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)] p-4">
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-8 w-full max-w-md">
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
          {renderField('companyName', t('auth.companyName'), 'text', companyName, setCompanyName)}
          {renderField('subdomain', t('auth.subdomainLabel') + ' ' + t('auth.subdomainHint'), 'text', subdomain, setSubdomain, t('auth.subdomainPlaceholder'))}
          {renderField('fullName', t('auth.fullName'), 'text', fullName, setFullName)}
          {renderField('email', t('auth.emailLabel'), 'email', email, setEmail)}
          {renderField('password', t('auth.passwordLabel'), 'password', password, setPassword, undefined, { minLength: 6 })}

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
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <RegisterForm />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
