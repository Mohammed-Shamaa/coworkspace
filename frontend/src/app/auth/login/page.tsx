'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { LanguageProvider } from '@/lib/language-provider'
import AuthBackground from '@/components/auth-background'
import { GoogleSignInButton } from '@/components/google-signin-button'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)
  const { login, loginWithGoogle } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    let credential = params.get('credential')
    if (!credential && window.location.hash) {
      credential = new URLSearchParams(window.location.hash.substring(1)).get('id_token')
    }
    if (credential) {
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
      setLoading(true)
      loginWithGoogle(credential).then((result) => {
        if (result.requiresRegistration) {
          router.push('/auth/complete-google-registration')
        } else {
          router.push('/dashboard')
        }
      }).catch((err: unknown) => {
        const apiErr = err as { apiError?: { message: string } }
        setError(apiErr?.apiError?.message || 'Google sign-in failed.')
      }).finally(() => setLoading(false))
    }
  }, [loginWithGoogle, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return
    setError('')
    if (!email.trim() || !password.trim()) {
      setError(t('auth.fillRequired'))
      return
    }
    submittingRef.current = true
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      const apiErr = err as { apiError?: { status: number; message: string; code?: string }; code?: string; response?: { status?: number; data?: { message?: string; title?: string } } }
      if (apiErr.apiError) {
        setError(apiErr.apiError.message)
      } else if (apiErr.code === 'ERR_NETWORK' || !apiErr.response) {
        setError(t('auth.connectionError'))
      } else if (apiErr.code === 'ECONNABORTED') {
        setError(t('auth.timeoutError'))
      } else if (apiErr.response?.status === 401) {
        setError(t('auth.invalidCredentials'))
      } else {
        setError(apiErr.response?.data?.message || apiErr.response?.data?.title || t('auth.loginFailed'))
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
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/5 p-6 md:p-8 w-full max-w-sm mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('auth.loginTitle')}</h1>
          <p className="text-[var(--text-secondary)] text-sm">{t('auth.loginSubtitle')}</p>
        </div>

        {error && (
          <div className="bg-[var(--error-bg)] text-[var(--error-text)] p-3 rounded font-semibold text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('auth.email')}</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('common.emailPlaceholder')} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('auth.password')}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('common.passwordPlaceholder')} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>

        <GoogleSignInButton />

        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          {t('auth.noAccount')}{' '}
          <Link href="/auth/register" className="text-[#1565C0] font-semibold hover:underline whitespace-nowrap">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <LanguageProvider>
      <LoginForm />
    </LanguageProvider>
  )
}
