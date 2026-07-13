'use client'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_prompt?: boolean
          }) => void
          renderButton: (
            element: HTMLElement,
            options: {
              type?: string
              shape?: string
              theme?: string
              text?: string
              size?: string
              logo_alignment?: string
              width?: string
            }
          ) => void
          prompt: () => void
          cancel: () => void
        }
      }
    }
  }
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

export function GoogleSignInButton() {
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const [gisReady, setGisReady] = useState(false)
  const [gisError, setGisError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { loginWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (initializedRef.current) return

    const handleCredentialResponse = async (response: { credential: string }) => {
      setSubmitting(true)
      try {
        const result = await loginWithGoogle(response.credential)
        if (result.requiresRegistration) {
          router.push('/auth/complete-google-registration')
        }
      } catch {
        // Handled by auth context / api interceptor
      } finally {
        setSubmitting(false)
      }
    }

    const initGIS = () => {
      if (!window.google?.accounts?.id || !buttonContainerRef.current) return
      initializedRef.current = true

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        setGisError('Google Sign-In is not configured')
        return
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_prompt: false,
        })

        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'signin_with',
          size: 'large',
          logo_alignment: 'left',
          width: '100%',
        })

        setGisReady(true)
      } catch {
        setGisError('Failed to initialize')
      }
    }

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGIS
      script.onerror = () => setGisError('Failed to load')
      document.body.appendChild(script)
      return () => {
        if (script.parentNode) document.body.removeChild(script)
      }
    }

    initGIS()
  }, [loginWithGoogle, router])

  return (
    <div className="w-full">
      <div className="relative flex items-center gap-4 my-5">
        <div className="flex-1 border-t border-[var(--card-border)]" />
        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-[0.12em] font-medium select-none">
          {submitting ? 'Signing in…' : 'or'}
        </span>
        <div className="flex-1 border-t border-[var(--card-border)]" />
      </div>

      {gisError && !gisReady && (
        <p className="text-xs text-[var(--error-text)] text-center mb-3">{gisError}</p>
      )}

      {!gisReady ? (
        <button
          type="button"
          disabled={!!gisError || submitting}
          onClick={() => {
            if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && window.google?.accounts?.id) {
              initializedRef.current = false
              window.google.accounts.id.prompt()
            }
          }}
          className="group relative w-full flex items-center justify-center gap-3 px-5 py-3
            border border-[var(--card-border)] rounded-xl
            bg-white dark:bg-[#111432]
            text-[var(--text-primary)]
            shadow-sm
            transition-all duration-300 ease-out
            hover:scale-[1.02] hover:shadow-md hover:border-gray-300
            dark:hover:border-gray-600 dark:hover:shadow-[0_4px_20px_rgba(255,255,255,0.06)]
            active:scale-[0.98] active:shadow-sm
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm
          "
        >
          <span className="relative z-10 flex items-center justify-center w-[22px] h-[22px]">
            {submitting ? (
              <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <GoogleIcon />
            )}
          </span>
          <span className="relative z-10 text-sm font-semibold tracking-tight">
            {submitting
              ? 'Signing in…'
              : gisError
                ? 'Google unavailable'
                : 'Sign in with Google'
            }
          </span>
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-white/[0.02] dark:to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      ) : null}

      <div ref={buttonContainerRef} className={`w-full flex justify-center ${gisReady ? '' : 'hidden'}`} />
    </div>
  )
}
