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

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/')
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Unable to connect to the server. Please ensure the backend is running on port 5000 and try again.')
      } else if (err.code === 'ECONNABORTED') {
        setError('Connection timed out. Please check your network and try again.')
      } else {
        setError(err.response?.data?.message || err.response?.data?.title || t('auth.loginFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)]">
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-8 w-96">
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
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">{t('auth.password')}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          {t('auth.noAccount')}{' '}
          <Link href="/auth/register" className="text-[#1565C0] font-semibold hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <LoginForm />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
