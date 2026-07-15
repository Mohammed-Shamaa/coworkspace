'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import i18n from './i18n'
import api, { setIsLoggingOut } from './api'
import type { User, Tenant, AuthResponse, GoogleLoginResponse } from '@/types'

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  loading: boolean
  onboardingCompleted: boolean | null
  checkOnboardingStatus: () => Promise<void>
  refreshTenant: () => Promise<void>
  login: (email: string, password: string) => Promise<AuthResponse>
  loginWithGoogle: (idToken: string) => Promise<GoogleLoginResponse>
  completeGoogleRegistration: (data: {
    registrationToken: string
    fullName: string
    companyName: string
    subdomain: string
    whatsappNumber: string
    password: string
  }) => Promise<AuthResponse>
  register: (data: Record<string, unknown>) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null)

  useEffect(() => {
    let redirected = false

    const init = async () => {
      try {
        if (typeof window === 'undefined') return

        const token = localStorage.getItem('token')
        const expiresAt = localStorage.getItem('expiresAt')

        if (!token || !expiresAt) return

        const exp = new Date(expiresAt)
        const isExpired = !isNaN(exp.getTime()) && exp <= new Date()

        if (isExpired) {
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            try {
              const res = await api.post('/auth/refresh', { refreshToken })
              const { token: newToken, expiresAt: newExpiresAt, user: newUser, tenant: newTenant } = res.data
              localStorage.setItem('token', newToken)
              localStorage.setItem('expiresAt', newExpiresAt)
              if (newUser) {
                localStorage.setItem('user', JSON.stringify(newUser))
                setUser(newUser)
              }
              if (newTenant) {
                localStorage.setItem('tenant', JSON.stringify(newTenant))
                setTenant(newTenant)
              }
              return
            } catch {
              // refresh failed
            }
          }

          redirected = true
          localStorage.clear()
          window.location.href = '/auth/login'
          return
        }

        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try { setUser(JSON.parse(storedUser)) } catch { /* ignore */ }
        }
        const storedTenant = localStorage.getItem('tenant')
        if (storedTenant) {
          try { setTenant(JSON.parse(storedTenant)) } catch { /* ignore */ }
        }
      } catch (e) {
        console.warn('[AuthProvider] localStorage access failed during init:', e)
      } finally {
        if (!redirected) setLoading(false)
      }
    }

    init()
  }, [])

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const res = await api.get('/setup/status')
      setOnboardingCompleted(res.data.onboardingCompleted)
    } catch {
      setOnboardingCompleted(null)
    }
  }, [])

  const refreshTenant = useCallback(async () => {
    try {
      const res = await api.get('/setup/info')
      const info = res.data
      setTenant(prev => {
        const updatedTenant = {
          ...prev,
          hasMeetingRoom: info.hasMeetingRoom,
          address: info.address,
          openingTime: info.openingTime,
          closingTime: info.closingTime,
        } as Tenant
        if (updatedTenant) {
          localStorage.setItem('tenant', JSON.stringify(updatedTenant))
        }
        return updatedTenant
      })
    } catch { /* ignore */ }
  }, [])

  const handleAuthResponse = useCallback((data: AuthResponse) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('expiresAt', data.expiresAt)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('tenant', JSON.stringify(data.tenant))
    setUser(data.user)
    setTenant(data.tenant)
    setOnboardingCompleted(null)
  }, [])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await api.post('/auth/google-login', { idToken })
    const data = res.data as GoogleLoginResponse

    if (!data.requiresRegistration) {
      handleAuthResponse(res.data as unknown as AuthResponse)
    }

    return data
  }, [handleAuthResponse])

  const completeGoogleRegistration = useCallback(async (data: {
    registrationToken: string
    fullName: string
    companyName: string
    subdomain: string
    whatsappNumber: string
    password: string
  }) => {
    const res = await api.post('/auth/complete-google-registration', data)
    handleAuthResponse(res.data)
    return res.data
  }, [handleAuthResponse])

  const login = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw { apiError: { status: 0, message: i18n.t('common.authValidationRequired'), code: 'VALIDATION_ERROR' } }
    }
    const res = await api.post('/auth/login', { email: email.trim(), password })
    handleAuthResponse(res.data)
    return res.data
  }, [handleAuthResponse])

  const register = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.post('/auth/register', data)
    handleAuthResponse(res.data)
  }, [handleAuthResponse])

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refreshToken')
    try { sessionStorage.setItem('_manualLogout', 'true') } catch { /* ignore */ }
    setIsLoggingOut(true)
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => { /* best-effort */ })
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('expiresAt')
    localStorage.removeItem('user')
    localStorage.removeItem('tenant')
    setUser(null)
    setTenant(null)
    window.location.href = '/auth/login'
  }, [])

  const value = useMemo(() => ({
    user,
    tenant,
    loading,
    onboardingCompleted,
    checkOnboardingStatus,
    refreshTenant,
    login,
    loginWithGoogle,
    completeGoogleRegistration,
    register,
    logout,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'SuperAdmin',
  }), [user, tenant, loading, onboardingCompleted, checkOnboardingStatus, refreshTenant, login, loginWithGoogle, completeGoogleRegistration, register, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
