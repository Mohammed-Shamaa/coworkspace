'use client'
import { LanguageProvider } from '@/lib/language-provider'
import { AuthGuard } from '@/components/auth-guard'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <LanguageProvider>
        <div className="min-h-screen bg-[var(--page-bg)]">
          {children}
        </div>
      </LanguageProvider>
    </AuthGuard>
  )
}
