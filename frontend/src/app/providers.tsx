'use client'
import { ThemeProvider } from '@/lib/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import { LanguageProvider } from '@/lib/language-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
