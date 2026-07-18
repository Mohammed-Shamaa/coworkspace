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
  whatsappNumber?: string[]
  general?: string[]
  [key: string]: string[] | undefined
}

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
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
    if (!password.trim() || password.length < 8) clientErrors.password = [t('auth.passwordError')]
    if (!fullName.trim()) clientErrors.fullName = [t('errors.generic')]
    if (!companyName.trim()) clientErrors.companyName = [t('errors.generic')]
    if (!subdomain.trim()) clientErrors.subdomain = [t('errors.generic')]
    if (!whatsappNumber.trim()) clientErrors.whatsappNumber = [t('auth.whatsappError')]

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      setErrorMessage(t('auth.fillRequired'))
      return
    }

    setLoading(true)
    try {
      await register({
        email, password, fullName, companyName, subdomain: subdomain.toLowerCase(), whatsappNumber,
      })
      router.push('/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as { apiError?: { status: number; message: string; code?: string }; code?: string; response?: { status?: number; data?: { message?: string; title?: string; errors?: Record<string, string[]> } }; message?: string }
      if (axiosErr.apiError?.status === 0 || axiosErr.code === 'ERR_NETWORK') {
        setErrorMessage(t('auth.connectionError'))
      } else if (axiosErr.code === 'ECONNABORTED') {
        setErrorMessage(t('auth.timeoutError'))
      } else {
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
          setErrorMessage(t('auth.connectionError'))
        }
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
      <nav className="absolute left-2 md:left-6 top-3 md:top-6 flex items-center gap-1 md:gap-2">
        <Link
          href="/"
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:scale-[1.02] hover:bg-blue-50 hover:text-[#1565C0] dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
        >
          {t('sidebar.home')}
        </Link>
        <Link
          href="/about"
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:scale-[1.02] hover:bg-blue-50 hover:text-[#1565C0] dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
        >
          {t('landing.navbar.about')}
        </Link>
      </nav>
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/5 p-6 md:p-8 w-full max-w-sm md:max-w-md mx-4">
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
          {renderField('companyName', t('auth.companyName'), 'text', companyName, setCompanyName, t('common.companyPlaceholder'))}
          {renderField('subdomain', t('auth.subdomainLabel') + ' ' + t('auth.subdomainHint'), 'text', subdomain, setSubdomain, t('auth.subdomainPlaceholder'))}
          {renderField('whatsappNumber', t('auth.whatsappLabel'), 'tel', whatsappNumber, setWhatsappNumber, t('auth.whatsappPlaceholder'))}
          {renderField('fullName', t('auth.fullName'), 'text', fullName, setFullName, t('common.namePlaceholder'))}
          {renderField('email', t('auth.emailLabel'), 'email', email, setEmail, t('common.emailPlaceholder'))}
          {renderField('password', t('auth.passwordLabel'), 'password', password, setPassword, t('common.passwordPlaceholder'), { minLength: 6 })}

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
          <Link href="/auth/login" className="text-[#1565C0] font-semibold hover:underline whitespace-nowrap">{t('auth.signInLink')}</Link>
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
