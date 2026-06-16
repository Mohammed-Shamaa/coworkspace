import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
let last429Warning = 0

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

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
    const originalRequest = error.config
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
          const { token } = res.data
          localStorage.setItem('token', token)
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('tenant')
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
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
  create: (data: any) => api.post('/members', data),
  update: (id: number, data: any) => api.put(`/members/${id}`, data),
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
  updateSettings: (data: any) => api.put('/tenants/settings', data),
}

export const setupApi = {
  getStatus: () => api.get('/setup/status'),
  getInfo: () => api.get('/setup/info'),
  saveWorkspaceInfo: (data: any) => api.post('/setup/workspace-info', data),
  saveAddress: (data: any) => api.post('/setup/address', data),
  saveWorkingHours: (data: any) => api.post('/setup/working-hours', data),
  complete: () => api.post('/setup/complete'),
}

export const meetingRoomApi = {
  getAll: (params?: { date?: string; search?: string }) => api.get('/meetingroom', { params }),
  getById: (id: number) => api.get(`/meetingroom/${id}`),
  create: (data: any) => api.post('/meetingroom', data),
  update: (id: number, data: any) => api.put(`/meetingroom/${id}`, data),
  delete: (id: number) => api.delete(`/meetingroom/${id}`),
  getStats: () => api.get('/meetingroom/stats'),
  getUpcoming: () => api.get('/meetingroom/upcoming'),
}
