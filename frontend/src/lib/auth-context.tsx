'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
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
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    try { return JSON.parse(localStorage.getItem('user') || 'null') }
    catch { return null }
  })
  const [tenant, setTenant] = useState<Tenant | null>(() => {
    if (typeof window === 'undefined') return null
    try { return JSON.parse(localStorage.getItem('tenant') || 'null') }
    catch { return null }
  })
  const [loading, setLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token')
      const expiresAt = localStorage.getItem('expiresAt')
      if (token && expiresAt && new Date(expiresAt) <= new Date()) {
        localStorage.clear()
        setUser(null)
        setTenant(null)
        router.push('/auth/login')
      }
      setLoading(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [router])

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
      const updatedTenant = {
        ...tenant,
        hasMeetingRoom: info.hasMeetingRoom,
        address: info.address,
        openingTime: info.openingTime,
        closingTime: info.closingTime,
      } as Tenant
      if (updatedTenant) {
        localStorage.setItem('tenant', JSON.stringify(updatedTenant))
        setTenant(updatedTenant)
      }
    } catch { /* ignore */ }
  }, [tenant])

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
    const res = await api.post('/auth/login', { email, password })
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
    router.push('/auth/login')
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
