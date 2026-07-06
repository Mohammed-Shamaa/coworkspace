export type TenantStatus = 'Pending' | 'Approved' | 'Rejected'
export type TenantPaymentStatus = 'Trial' | 'Active' | 'Expired' | 'Suspended'

export interface Tenant {
  id: number
  name: string
  subdomain: string
  logoUrl: string
  primaryColor: string
  companyName: string
  hasMeetingRoom?: boolean
  status?: TenantStatus
  paymentStatus?: TenantPaymentStatus
  trialStartDate?: string | null
  subscriptionExpiryDate?: string | null
}

export interface AdminTenant {
  id: number
  name: string
  companyName: string
  subdomain: string
  whatsappNumber: string
  address: string
  totalDesks: number | null
  maxCapacity: number | null
  hasMeetingRoom: boolean
  openingTime: string | null
  closingTime: string | null
  createdAt: string
  adminEmail: string | null
  adminName: string | null
  status?: string
  paymentStatus?: string
  trialStartDate?: string | null
  subscriptionExpiryDate?: string | null
  approvalDate?: string | null
  memberCount?: number
}

export interface AdminStats {
  totalTenants: number
  pendingTenants: number
  approvedTenants: number
  rejectedTenants: number
  activeSubscriptions: number
  trialTenants: number
  totalMembers: number
}

export interface User {
  id: number
  email: string
  fullName: string
  role: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  expiresAt: string
  user: User
  tenant: Tenant
}

export interface Member {
  id: number
  fullName: string
  phoneNumber: string
  nationalId: string
  memberType: string
  workerType: string | null
  registrationDate: string
  endDate: string | null
  noEndDate: boolean
  attendancePlan: string
  attendanceSchedule: string | null
  startTime: string
  endTime: string
  deskNumber: string
  workingHours: number
  subscriptionMonths: number
  remainingDays: number
  timePeriod: string
  monthlyFee: number
  paymentStatus: string
  paymentStatusDisplay: string
  lastPaymentDate: string | null
  nextDueDate: string | null
  createdAt: string
  updatedAt: string
  payments?: Payment[]
}

export interface Payment {
  id: number
  paymentDate: string
  paymentTime: string
  amount: number
  status: string
  paidMonth: string
  recordedByUserName: string | null
  createdAt: string
}

export interface Dashboard {
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  unpaidMembers: number
  studentCount: number
  remoteWorkerCount: number
  monthlyIncome: number
  recentRegistrations: RecentRegistration[]
}

export interface RecentRegistration {
  id: number
  fullName: string
  memberType: string
  registrationDate: string
  monthlyFee: number
}

export interface Reservation {
  id: number
  personName: string
  reservationDate: string
  startTime: string
  endTime: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ReservationStats {
  totalReservations: number
  todaysReservations: number
  upcomingReservations: number
  pastReservations: number
}

export interface CreateReservationRequest {
  personName: string
  reservationDate: string
  startTime: string
  endTime: string
  notes?: string
}

export interface UpdateReservationRequest {
  personName: string
  reservationDate: string
  startTime: string
  endTime: string
  notes?: string
}

export interface CreateMemberRequest {
  fullName: string
  phoneNumber: string
  nationalId: string
  memberType: string
  workerType?: string
  registrationDate: string
  endDate?: string | null
  noEndDate: boolean
  attendancePlan: string
  attendanceSchedule?: string
  startTime: string
  endTime: string
  deskNumber: string
  monthlyFee: number
}


