'use client'
import { ThemeProvider } from '@/lib/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import { LanguageProvider } from '@/lib/language-provider'
import { AuthGuard } from '@/components/auth-guard'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <LanguageProvider>
            <div className="min-h-screen bg-[var(--page-bg)]">
              {children}
            </div>
          </LanguageProvider>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  )
}
