'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { LanguageProvider } from '@/lib/language-provider'
import AuthBackground from '@/components/auth-background'

function CompleteGoogleRegistrationForm() {
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)
  const [email, setEmail] = useState('')
  const { completeGoogleRegistration } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    const regToken = sessionStorage.getItem('googleRegToken')
    const googleEmail = sessionStorage.getItem('googleEmail')
    const googleName = sessionStorage.getItem('googleName')

    if (!regToken || !googleEmail) {
      router.replace('/auth/login')
      return
    }

    if (googleName) setFullName(googleName)
    setEmail(googleEmail)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return
    setError('')

    if (!fullName.trim() || !companyName.trim() || !subdomain.trim() || !whatsappNumber.trim() || !password) {
      setError(t('auth.fillRequired'))
      return
    }

    if (password.length < 8) {
      setError(t('auth.passwordError'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'))
      return
    }

    const regToken = sessionStorage.getItem('googleRegToken')
    if (!regToken) {
      setError('Session expired. Please sign in with Google again.')
      return
    }

    submittingRef.current = true
    setLoading(true)
    try {
      await completeGoogleRegistration({
        registrationToken: regToken,
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        subdomain: subdomain.trim().toLowerCase(),
        whatsappNumber: whatsappNumber.trim(),
        password,
      })
      sessionStorage.removeItem('googleRegToken')
      sessionStorage.removeItem('googleEmail')
      sessionStorage.removeItem('googleName')
      router.push('/onboarding')
    } catch (err: unknown) {
      const apiErr = err as { apiError?: { message: string; status?: number }; response?: { data?: { message?: string; errors?: Record<string, string[]> } }; code?: string }

      if (apiErr.apiError?.status === 0 || apiErr.code === 'ERR_NETWORK') {
        setError(t('auth.connectionError'))
      } else if (apiErr.apiError?.message) {
        setError(apiErr.apiError.message)
      } else if (apiErr.response?.data?.message) {
        const serverMsg = apiErr.response.data.message
        const serverErrors = apiErr.response.data.errors
        if (serverErrors?.subdomain) {
          setError(serverErrors.subdomain[0])
        } else if (serverErrors?.email) {
          setError(serverErrors.email[0])
        } else {
          setError(serverMsg)
        }
      } else {
        setError(t('auth.loginFailed'))
      }
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--page-bg)]">
      <AuthBackground />
      <nav className="absolute left-2 md:left-6 top-3 md:top-6 flex items-center gap-1 md:gap-2">
        <Link
          href="/auth/login"
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:scale-[1.02] hover:bg-blue-50 hover:text-[#1565C0] dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
        >
          {t('sidebar.home')}
        </Link>
      </nav>
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/5 p-6 md:p-8 w-full max-w-sm mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Complete Your Account</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Signed in as <span className="font-semibold text-[var(--text-primary)]">{email}</span>
          </p>
          <p className="text-[var(--text-secondary)] text-xs mt-1">{t('auth.googleSubtitle')}</p>
        </div>

        {error && (
          <div className="bg-[var(--error-bg)] text-[var(--error-text)] p-3 rounded font-semibold text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('auth.fullName')}</label>
            <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('auth.companyName')}</label>
            <Input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company LLC" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('auth.workspaceName')}</label>
            <Input type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder={t('auth.subdomainPlaceholder')} required />
            <p className="text-xs text-[var(--text-secondary)] mt-1">{t('auth.subdomainLabel')} {t('auth.subdomainHint')}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('auth.whatsappLabel')}</label>
            <Input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+1234567890" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('auth.passwordLabel')}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.passwordPlaceholder')} required />
            <p className="text-xs text-[var(--text-secondary)] mt-1">{t('auth.passwordHint')}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('auth.confirmPassword')}</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('auth.confirmPasswordPlaceholder')} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('auth.creatingAccount') : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function CompleteGoogleRegistrationPage() {
  return (
    <LanguageProvider>
      <CompleteGoogleRegistrationForm />
    </LanguageProvider>
  )
}
