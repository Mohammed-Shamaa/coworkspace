import axios from 'axios'
import type { CreateMemberRequest, CreateReservationRequest, UpdateReservationRequest } from '@/types'
import type { ApiError } from './utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
let last429Warning = 0

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
})

function getToken(): string | null {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null
  } catch {
    return null
  }
}

function getExpiresAt(): string | null {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('expiresAt') : null
  } catch {
    return null
  }
}

function getRefreshToken(): string | null {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
  } catch {
    return null
  }
}

function safeRemoveAll(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('expiresAt')
      localStorage.removeItem('user')
      localStorage.removeItem('tenant')
    }
  } catch { /* ignore */ }
}

function isTokenExpired(): boolean {
  const expiresAt = getExpiresAt()
  if (!expiresAt) return true
  try {
    const exp = new Date(expiresAt)
    return isNaN(exp.getTime()) || exp <= new Date()
  } catch {
    return true
  }
}

function isTokenExpiringSoon(minutes = 5): boolean {
  const expiresAt = getExpiresAt()
  if (!expiresAt) return true
  try {
    const exp = new Date(expiresAt)
    if (isNaN(exp.getTime())) return true
    const soon = new Date(Date.now() + minutes * 60 * 1000)
    return exp <= soon
  } catch {
    return true
  }
}

// Proactive token refresh: before every request, refresh if token is about to expire.
let refreshPromise: Promise<boolean> | null = null

async function refreshTokenIfNeeded(): Promise<void> {
  if (typeof window === 'undefined') return

  const token = getToken()
  if (!token) return

  // Only refresh if token is expiring soon or already expired
  if (!isTokenExpiringSoon(5) && !isTokenExpired()) return

  const refreshToken = getRefreshToken()
  if (!refreshToken) return

  if (refreshPromise) {
    await refreshPromise
    return
  }

  refreshPromise = (async () => {
    try {
      const res = await api.post('/auth/refresh', { refreshToken })
      const { token: newToken } = res.data
      if (newToken) {
        try { localStorage.setItem('token', newToken) } catch { /* ignore */ }
        return true
      }
      return false
    } catch {
      safeRemoveAll()
      try { window.location.href = '/auth/login' } catch { /* ignore */ }
      return false
    }
  })()

  const result = await refreshPromise
  refreshPromise = null
  // If refresh failed, redirect already happened; allow request to proceed
  // (it will get 401 and be handled by the response interceptor)
}

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const isAuthRequest = config.url?.startsWith('/auth/login') || config.url?.startsWith('/auth/register') || config.url?.startsWith('/auth/refresh')

    if (!isAuthRequest) {
      try {
        await refreshTokenIfNeeded()
      } catch {
        // refresh failed, redirect already happened
        return Promise.reject(config)
      }
    }

    const token = getToken()
    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalizedError: ApiError = {
      status: 0,
      message: 'Server is not reachable. Please check your connection and try again.',
      code: 'NETWORK_ERROR'
    }

    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      normalizedError.status = status
      normalizedError.message = data?.message ?? data?.error ?? 'An unexpected error occurred.'
      normalizedError.code = data?.code
      normalizedError.errors = data?.errors
    }

    error.apiError = normalizedError

    if (process.env.NODE_ENV === 'development') {
      if (error.response) {
        if (error.response.status === 429) {
          const now = Date.now()
          if (now - last429Warning > 5000) {
            last429Warning = now
            console.warn('[API] Rate limited — slowing down.')
          }
        } else if (error.response.status >= 500) {
          console.warn(`[API] ${error.response.status} on ${error.config?.url}:`, error.response.data)
        }
      } else if (error.request) {
        console.warn('[API] Network error — no response received.')
      }
    }

    const originalRequest = error.config as { _retry?: boolean; _refreshAttempt?: boolean; headers: Record<string, string>; url?: string }
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

      if (originalRequest.url?.includes('/auth/refresh')) {
        safeRemoveAll()
        if (typeof window !== 'undefined') {
          try { window.location.href = '/auth/login' } catch { /* ignore */ }
        }
        return Promise.reject(error)
      }

      originalRequest._retry = true
      try {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          const res = await api.post('/auth/refresh', { refreshToken })
          const { token } = res.data
          if (token) {
            try { localStorage.setItem('token', token) } catch { /* ignore */ }
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          }
        }
      } catch {
        safeRemoveAll()
        if (typeof window !== 'undefined') {
          try { window.location.href = '/auth/login' } catch { /* ignore */ }
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; fullName: string; companyName: string; subdomain: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

export const membersApi = {
  getAll: (params?: { search?: string; filter?: string; type?: string; paymentStatus?: string; expired?: boolean }) =>
    api.get('/members', { params }),
  getById: (id: number) => api.get(`/members/${id}`),
  create: (data: CreateMemberRequest) => api.post('/members', data),
  update: (id: number, data: Partial<CreateMemberRequest>) => api.put(`/members/${id}`, data),
  delete: (id: number) => api.delete(`/members/${id}`),
  markPaid: (id: number, data?: { recordedByUserId?: number }) => api.post(`/members/${id}/mark-paid`, data),
  downloadPdf: (id: number) => api.get(`/members/${id}/pdf`, { responseType: 'blob' }),
  exportExcel: () => api.get('/export/members-excel', { responseType: 'blob' }),
}

export const paymentsApi = {
  getAll: (params?: { memberId?: number; page?: number; pageSize?: number }) =>
    api.get('/payments', { params }),
}

export const tenantsApi = {
  getSettings: () => api.get('/tenants/settings'),
  updateSettings: (data: { companyName: string; name: string; primaryColor: string; logoUrl: string }) => api.put('/tenants/settings', data),
}

export const setupApi = {
  getStatus: () => api.get('/setup/status'),
  getInfo: () => api.get('/setup/info'),
  saveWorkspaceInfo: (data: { totalDesks: number; maxCapacity: number; hasMeetingRoom: boolean }) => api.post('/setup/workspace-info', data),
  saveAddress: (data: { address: string }) => api.post('/setup/address', data),
  saveWorkingHours: (data: { openingTime: string; closingTime: string }) => api.post('/setup/working-hours', data),
  complete: () => api.post('/setup/complete'),
}

export const meetingRoomApi = {
  getAll: (params?: { date?: string; search?: string }) => api.get('/meetingroom', { params }),
  getById: (id: number) => api.get(`/meetingroom/${id}`),
  create: (data: CreateReservationRequest) => api.post('/meetingroom', data),
  update: (id: number, data: UpdateReservationRequest) => api.put(`/meetingroom/${id}`, data),
  delete: (id: number) => api.delete(`/meetingroom/${id}`),
  getStats: () => api.get('/meetingroom/stats'),
  getUpcoming: () => api.get('/meetingroom/upcoming'),
}
