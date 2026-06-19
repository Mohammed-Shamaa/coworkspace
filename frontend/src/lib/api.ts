import axios from 'axios'
import type { CreateMemberRequest, CreateReservationRequest, UpdateReservationRequest } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
let last429Warning = 0

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
})

// Warn in production if frontend is configured to talk to localhost which
// will fail for public deployments. This helps catch misconfigured env vars.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
      console.error('[API] NEXT_PUBLIC_API_URL appears to be pointing to localhost. Update the environment variable for production.')
    }
  } catch {
    /* ignore */
  }
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const isAuthRequest = config.url?.startsWith('/auth/login') || config.url?.startsWith('/auth/register') || config.url?.startsWith('/auth/refresh')
    const token = localStorage.getItem('token')
    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.status} ${response.config.url}`)
    }
    return response
  },
  async (error) => {
    if (process.env.NODE_ENV === 'development') {
      if (error.response) {
        if (error.response.status === 429) {
          const now = Date.now()
          if (now - last429Warning > 5000) {
            last429Warning = now
            console.warn('[API Rate Limited] Too many requests. Please slow down.')
          }
        } else {
          console.error(`[API Error] ${error.response.status} ${error.config?.url}`, error.response.data)
        }
      } else if (error.request) {
        console.error('[API Network Error] No response received:', error.message)
      } else {
        console.error('[API Error] Setup error:', error.message)
      }
    }
    const originalRequest = error.config as { _retry?: boolean; headers: Record<string, string>; url?: string }
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Guard localStorage / window access in case of restricted environments
      const safeRemoveAll = () => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            localStorage.removeItem('tenant')
          }
        } catch { /* ignore */ }
      }

      if (originalRequest.url?.includes('/auth/refresh')) {
        safeRemoveAll()
        if (typeof window !== 'undefined') {
          try { window.location.href = '/auth/login' } catch { /* ignore */ }
        }
        return Promise.reject(error)
      }
      originalRequest._retry = true
      try {
        let refreshToken: string | null = null
        try { refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null } catch { refreshToken = null }
        if (refreshToken) {
          const res = await api.post('/auth/refresh', { refreshToken })
          const { token } = res.data
          try { localStorage.setItem('token', token) } catch { /* ignore */ }
          if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
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
