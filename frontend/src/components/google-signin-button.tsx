'use client'
import { useEffect, useRef } from 'react'
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

export function GoogleSignInButton() {
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const { loginWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (initializedRef.current) return

    const handleCredentialResponse = async (response: { credential: string }) => {
      try {
        const result = await loginWithGoogle(response.credential)
        if (result.requiresRegistration) {
          router.push('/auth/complete-google-registration')
        }
      } catch {
        // Error handled by auth context / api interceptor
      }
    }

    const initGIS = () => {
      if (!window.google?.accounts?.id || !buttonContainerRef.current) return
      initializedRef.current = true

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        console.warn('[GoogleSignIn] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set')
        return
      }

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
    }

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGIS
      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }

    initGIS()
  }, [loginWithGoogle, router])

  return (
    <div className="w-full">
      <div className="relative flex items-center gap-3 my-4">
        <div className="flex-1 border-t border-[var(--border-color)]" />
        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">or</span>
        <div className="flex-1 border-t border-[var(--border-color)]" />
      </div>
      <div ref={buttonContainerRef} className="w-full flex justify-center" />
    </div>
  )
}
