'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from './api'
import type { User, Tenant, AuthResponse } from '@/types'

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  loading: boolean
  onboardingCompleted: boolean | null
  checkOnboardingStatus: () => Promise<void>
  refreshTenant: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; fullName: string; companyName: string; subdomain: string }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null)
  const routerRef = useRef(useRouter())

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token')
          const expiresAt = localStorage.getItem('expiresAt')
          if (token && expiresAt) {
            const exp = new Date(expiresAt)
            if (!isNaN(exp.getTime()) && exp <= new Date()) {
              localStorage.clear()
              setUser(null)
              setTenant(null)
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
          }
        }
      } catch (e) {
        console.warn('[AuthProvider] localStorage access failed during init:', e)
      } finally {
        setLoading(false)
      }
    }, 0)
    return () => clearTimeout(timer)
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

  const handleAuthResponse = (data: AuthResponse) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('expiresAt', data.expiresAt)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('tenant', JSON.stringify(data.tenant))
    setUser(data.user)
    setTenant(data.tenant)
    setOnboardingCompleted(null)
  }

  const login = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw { apiError: { status: 0, message: 'Email and password are required.', code: 'VALIDATION_ERROR' } }
    }
    const res = await api.post('/auth/login', { email: email.trim(), password })
    handleAuthResponse(res.data)
  }

  const register = async (data: { email: string; password: string; fullName: string; companyName: string; subdomain: string }) => {
    const res = await api.post('/auth/register', data)
    handleAuthResponse(res.data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('expiresAt')
    localStorage.removeItem('user')
    localStorage.removeItem('tenant')
    setUser(null)
    setTenant(null)
    routerRef.current.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ user, tenant, loading, onboardingCompleted, checkOnboardingStatus, refreshTenant, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
